// HTML
const htmlInputs = `
            <div class="container-box">
                <img src="./asserts/Brand.svg">
                <div class="content-box">
                    <p>Insira os números a serem sorteados</p>
                    <div class="container-input">
                        <div class="content-input-item">
                            <label for="min">Entre</label>
                            <input id="min" oninput='validate(event)' class="enters" type="text" />
                        </div>
                        <div class="content-input-item">
                            <label for="max">e</label>
                            <input id="max" oninput='validate(event)' class="enters" type="text" />
                        </div>
                    </div>
                    <div id="content-button"></div>
                </div>
            </div>`

const htmlButtonStart = `
    <label class="button-secondary left-button button-label" id="importar-dados" for="file-input">Importar dados</label>
    <input type="file" id="file-input" accept=".csv" />
    <button class="button-primary right-button" id="random-button" onclick="startRandom()" disabled>Sortear</button>`

const htmlNumber = `
        <div class="container-box">
            <div class="content-box">
                <label id="random-number"></label>
                <label id="selected-participant"></label>
            <div>
            <div id="content-button"></div>
        </div>`

const htmlButtonStop = `
        <button class="button-secondary left-button button-label" onclick="back()">Reiniciar</button>
        <button class="button-primary right-button" id="random-button" onclick="startRandom()">Sortear novamente</button>`


const htmlNoNumber = `
        <div class="container-box">
            <div class="content-box">
                <label>Não há mais números</label>
            <div>
            <div id="content-button"></div>
        </div>`

const htmlCacheNumbers = `
            <div id="cache-content">
                    <h2>Números Sorteados:</h2>
                    <div id="cache-content-numbers"></div>
            <div>`


// ########## Constantes Globais ##########
const MAX_DIGITOS_INPUT = 4;

// ########## Variaveis Globais ##########
let intervalControler;
let timeoutControler;
let cacheNumbersSorted = []
let rangeNumbers = [];
let participants = [];
// Número min e max a serem sorteados
let MIN = null;
let MAX = null;


function range(start, end) {
    return Array(parseInt(end) - parseInt(start) + 1).fill().map((_, idx) => parseInt(start) + idx)
}

function randomNumber(saveChange) {
    if (rangeNumbers.length == 0) {
        return null;
    }

    let randomIndex = createRandomNumber(0, rangeNumbers.length - 1);
    let randomNumber = rangeNumbers[randomIndex];

    if (saveChange) {
        rangeNumbers.splice(randomIndex, 1)
    }

    return randomNumber;
}

function createRandomNumber(min, max) {
    return Math.floor(Math.random() * (parseInt(max) - min + 1)) + parseInt(min);
}

const intervalRandom = () => setInterval(() => {
    document.getElementById("random-number").innerHTML = randomNumber(false);
}, 80);

const getRandomNumber = () =>
    new Promise((resolve, reject) =>
        setTimeout(() => {
            clearInterval(intervalControler);
            try {
                let numberSorted = randomNumber(true);
                try {
                    let numberId = parseInt(numberSorted);
                    let participantSelected = participants.find(participant => {
                        return parseInt(participant.id) === numberId
                    });
                    document.getElementById("selected-participant").innerHTML = participantSelected.name;
                } catch (ex) {
                    document.getElementById("selected-participant").innerHTML = "";
                    console.debug(ex)
                }
                document.getElementById("random-number").innerHTML = numberSorted;
                resolve(numberSorted)
            } catch (e) {
                reject()
            }
        }, 3 * 1000));

async function startRandom() {
    clearInterval(intervalControler);

    // INIT
    if (MIN === null && MAX === null) {
        MIN = document.getElementById("min").value;
        MAX = document.getElementById("max").value;
        rangeNumbers = range(MIN, MAX)

        document.getElementById("main-content").innerHTML = htmlNumber;
        document.getElementById("content-button").innerHTML = htmlButtonStop;
        document.getElementById("cache-container").innerHTML = htmlCacheNumbers;
    }
    document.getElementById("selected-participant").innerHTML = "";

    disableButton(true);

    intervalControler = intervalRandom();
    timeoutControler = await getRandomNumber()
        .then((numberSorted) => {
            initConfetti(numberSorted);
        })
        .catch(() => {
            console.debug("Erro ao buscar número aleatório")
        })

}

function initConfetti(numberSorted) {
    setTimeout(function () {
        confetti.start()
    }, 1000);
    setTimeout(function () {
        confetti.stop()
        changeCacheHtml(numberSorted);
    }, 5000);
}

function changeCacheHtml(numberSorted) {
    if (rangeNumbers.length > 0) {
        disableButton(false)
        cacheNumbersSorted.push(numberSorted)
        let htmlCache = "";
        cacheNumbersSorted
            .reverse()
            .forEach((number) => {
                let numbermWithPipe = `<label class="number">${number}</label>`;
                htmlCache = htmlCache + `<div class="number-circle">` + numbermWithPipe + `</div>`;
            })

        htmlCache = `<div class="content-number-cache">` + htmlCache + `</div>`;

        document.getElementById("cache-content").innerHTML = htmlCacheNumbers;
        document.getElementById("cache-content-numbers").innerHTML = htmlCache;
    } else {
        console.log("Chegou")
        document.getElementById("main-content").innerHTML = htmlNoNumber;
        document.getElementById("content-button").innerHTML = htmlButtonStop;

        disableRightButton(true);
    }

}

function cleanSession() {
    cacheNumbersSorted = []
    rangeNumbers = [];
    participants = [];
}

function back() {
    cleanSession()
    clearInterval(intervalControler);
    clearTimeout(timeoutControler);
    initialContent();
}

function initialContent() {
    MIN = null;
    MAX = null;
    document.getElementById("main-content").innerHTML = htmlInputs;
    document.getElementById("content-button").innerHTML = htmlButtonStart;
    document.getElementById("cache-container").innerHTML = "";
    document.getElementById('file-input').addEventListener('change', readSingleFile, false);
}

function validate(evt) {
    if (evt.target.value) {
        let newInputValueMatch = evt.target.value.match(/\d+/g);
        let newValue = "";

        if (newInputValueMatch != null) {
            newValue = newInputValueMatch.join('').slice(0, MAX_DIGITOS_INPUT);
        }

        evt.target.value = newValue
    }

    disableButton(!isEnableButton());
}

function disableButton(disable) {
    console.log("Disbled Button: " + disable);
    document.querySelectorAll("button").forEach(button => button.disabled = disable);
}

function disableRightButton(disable) {
    document.querySelector("button.right-button").disabled = disable;
}

function isEnableButton() {
    const min = document.getElementById("min").value;
    const max = document.getElementById("max").value;

    return (min != null && max != null && parseInt(min) < parseInt(max));
}

// Listeners
function readSingleFile(e) {
    console.log("Importando arquivo...");
    let file = e.target.files[0];
    if (!file) {
        return;
    }

    participants = [];
    e.target.value = null;

    let reader = new FileReader();
    reader.onload = function (e) {
        let contents = e.target.result;
        parseCSVFile(contents);
    };
    reader.readAsText(file);
}

function parseCSVFile(contents) {
    try {
        contents.split("\n").forEach(line => {
            let lineSplited = line.split(",");
            let id = lineSplited[0];
            let name = lineSplited[1];
            participants.push({
                id,
                name
            });
        });
        document.getElementById("importar-dados").textContent = `Subistituir arquivo`;
        document.getElementById("importar-dados").style.color = "green";
    } catch (e) {
        participants = []
        alert("Arquivo com erro!")
    }
}

initialContent()
