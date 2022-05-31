const { response } = require('express');
const express = require('express');
const fs = require('fs');
const nodemailer = require('nodemailer');
const app = express();
const Datastore = require('nedb');
const port = process.env.PORT || 5000;

app.listen(port, () => console.log('listening at 5000'));
app.use(express.static('public'));
app.use(express.json({ limit: '1mb' }));

const db = new Datastore('database.db');
db.loadDatabase();

db.count({}, function (err, count) {
    if (count == 0) {
        // ha a db üres, akkor fusson le és töltse fel a db-t
        let rawdata = fs.readFileSync('data.json');
        let nftData = JSON.parse(rawdata);
        db.insert(nftData);
    } else {
        //ha a bd-be benne vannak az elemek, akkor fusson le
        //a post method ami bekéri a kliens oldalról az új módosított objektumot és ezzel felülírja a db-t
        console.log("van adat a DB-ben")
    }
});


//Ez elküldi az adatbázis tartalmát a kliens oldalnak
// app.get('/api', (request, response) => {
//     db.find({}, (err, data) => {
//         response.json(data)
//     });
// });


app.post('/', (request, response) => {
    console.log('I got a request!');
    let data = request.body;
    let timestamp = Date.now();
    data.timestamp = timestamp;
    console.log(data);

    //Ha a bonusUsed értéke false, akkor mehetünk csak tovább. Ha true, akkor visszadobja --> pipa

    db.find({ "nftSecret": data.userSecret }, function (err, docs) {
        let used = "";
        if (docs.length != 0) {
            used = docs[0].bonusUsed;
            //meg kell nézni, hogy a data.userSecret-hez van-e az adatbázisban adat. Ha van, akkor vissza kell adni a response-ban a képet és társait --> pipa
            if (used == false) {
                console.log(docs[0].src)
                response.json({
                    status: "success",
                    nftId: docs[0].nftId,
                    nftSrc: docs[0].src
                })
            } else {
                console.log(`Bonus is used: ${err}`);
                response.json({
                    status: "bonusUsed"
                })
            }

        } else {
            console.log(`Bonus don't matches: ${err}`);
            response.json({
                status: "unsuccesful"
            })
        }

    });

});

app.post('/datas', (request, response) => {
    console.log('I got a new request!');
    data = request.body;
    let timestamp = Date.now();
    data.timestamp = timestamp;
    console.log(data);

    //Emailt kell küldeni + át kell állítani a bonusUsed értékét true-ra --> Így tudjuk, hogy az már fel lett használva!!

    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'guma.prog@gmail.com',
            pass: '!`MDy,5PW__2C'
        }
    });

    let mailOptions = {
        from: 'guma.prog@gmail.com',
        to: 'matyas.gulyas92@gmail.com',
        subject: `Incoming message from ${data.firstName}`,
        text: `${data.firstName} ${data.familyName} has activated the secret code to her/his NFT
        Necessary datas to accomplish the shipping: 
        mail: ${data.userMail}
        Details for Post: ${data.address}`
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Datas sent to me: ' + info.response);
            db.update({ nftSecret: data.secret }, { $set: { bonusUsed: data.bonusUsed } }, {}, function (err, numReplaced) {
                // numReplaced = 3
                // Field 'system' on Mars, Earth, Jupiter now has value 'solar system'
            });
            //Response error is legyen külön kezelve?
            sendResponse();
            response.json({
                status: "success"
            })
        }
    });

});

function sendResponse() {

    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'guma.prog@gmail.com',
            pass: '!`MDy,5PW__2C'
        }
    });

    let mailOptions = {
        from: 'guma.prog@gmail.com',
        to: data.userMail,
        subject: `Thank You for Your Purchase!! - Your NFT is on the way ;)`,
        text: `Dear ${data.firstName} ${data.familyName}!

                We have recieved your datas to accomplish the sending.
                Your NFT would be send to you as soon as possible
                We will inform you if we know the estimated delivery time depending on your location.
                
                Sincirely, 
                Papp Lajos Máté `
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent to user: ' + info.response);
        }
    });

}


