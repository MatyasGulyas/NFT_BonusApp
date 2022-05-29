const inputContainer = document.querySelector('.inputList');
const imgContainer = document.querySelector('.imgList');
const submitSecretBtn = document.querySelector('#submitSecret');
const inputSecret = document.querySelector('#secret');
const wrongSecret = document.querySelector('.wrongSecret');
const usedSecret = document.querySelector('.usedSecret');
const responseMessage = document.querySelector('.response');
const responseFailed = document.querySelector('.responseFailed');
const submitFormBtn = document.querySelector('#submit');
let userSecret = "";

imgContainer.style.display = "none";
inputContainer.style.display = "none";
wrongSecret.style.display = "none";
usedSecret.style.display = "none";
responseMessage.style.display = "none";
responseFailed.style.display = "none";

async function submitSecret() {
    userSecret = document.getElementById("secret").value;
    const userSecretDb = { "userSecret": userSecret };

    const options = {
        method: 'POST',
        headers: {
            'Content-type': 'application/json'
        },
        body: JSON.stringify(userSecretDb)
    };

    const response = await fetch('/', options);
    const data = await response.json();
    console.log(data);

    if (data.status === "success") {

        submitSecretBtn.style.display = "none";
        inputSecret.style.display = "none";
        usedSecret.style.display = "none";
        wrongSecret.style.display = "none";
        inputContainer.style.display = "flex";
        imgContainer.style.display = "flex";


        let imgSegment = `
                <h2>Your NFT: Nr.${data.nftId}</h2>
                <img src="${data.nftSrc}" id="${data.nftId}" >
                <p>Wrong NFT? Contact us: xy@zmail.com</p>`;

        imgContainer.innerHTML = imgSegment;

    } else if (data.status === "bonusUsed") {
        // ide majd jöhet a UI módosítás, felugró ablakkal... visible unvisible switch... HTML-ben megcsinálni és itt csak switchelni a konténert
        usedSecret.style.display = "inline";
        usedSecret.childNodes[1].style.color = "red";
        wrongSecret.style.display = "none";
    } else {
        wrongSecret.style.display = "inline";
        wrongSecret.childNodes[1].style.color = "red";
        usedSecret.style.display = "none";
    }


    console.log(userSecret);
}


async function submitData() {
    const userFirstName = document.querySelector('#firstName').value;
    const userFamilyName = document.querySelector('#familyName').value;
    const userMail = document.querySelector('#mail').value;
    const userAddress = [document.querySelector('#country').value, document.querySelector('#zipCode').value, document.querySelector('#city').value, document.querySelector('#address').value]

    if (userFirstName && userFamilyName && userMail && userAddress != "") {

        let validRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

        if (userMail.match(validRegex)) {

            console.log("Valid email address!");

            function handleForm(event) { event.preventDefault(); }
            inputContainer.addEventListener('submit', handleForm);

            submitFormBtn.style.visibility = "hidden";

            const userData = {
                "firstName": userFirstName,
                "familyName": userFamilyName,
                "userMail": userMail,
                "address": userAddress,
                "bonusUsed": true,
                "secret": userSecret
            }

            const options = {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json'
                },
                body: JSON.stringify(userData)
            };

            const response = await fetch('/datas', options);
            const data = await response.json();
            console.log(data);


            if (data.status === "success") {
                //Ezt csak akkor kapom, ha a BackEnd már el is küldte az adatokat mailben

                responseMessage.style.display = "inline";
                inputContainer.style.display = "none";
                imgContainer.style.display = "none";

            } else {

                responseFailed.style.display = "inline";
                responseFailed.childNodes[1].style.color = "red";
                inputContainer.style.display = "none";
                imgContainer.style.display = "none";

            }

        } else {
            console.log("Invalid Email...")
        };

    } else {
        console.log("Missing Data from User!");
    }

}

        // async function getData() {
        //     const response = await fetch('/api');
        //     const data = await response.json();
        //     console.log(data);

        //     async function renderImages() {
        //         let html = '';
        //         data.forEach(image => {
        //             let htmlSegment = `<img src="${image.src}" id="${image.nftId}" >`;
        //             html += htmlSegment;
        //         });

        //         let container = document.querySelector('.imgList');
        //         container.innerHTML = html;
        //     }

        //     renderImages();

        //     console.log(data[0].nftId);

        // }

        // getData();