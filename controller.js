// HTML
const htmlInputs = `
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
            <div>
                <input type="file" id="file-input" /> 
            </div>`
const htmlButtonStart = `<button id="random-button" onclick="startRandom()" disabled>Sortear</button>`

const htmlNumber = `
        <div id="random-content">
            <label id="random-number"></label>
            <label id="selected-participant"></label>
        </div>`
const htmlButtonStop = `
    <div class="content-button">
        <button class="left-button" onclick="back()">Limpar</button>
        <button class="right-button" onclick="startRandom()">Sortear Novamente</button>
    <div>`

const htmlCacheNumbers = `
            <div id="cache-content">
                <div id="cache-item">
                    <h2>Números Sorteados</h2>
                    <div id="cache-content-numbers"></div>
                <div>
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
                    console.log(ex)
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
            disableButton(false)
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
            .forEach((number, index) => {
                let pipe = "";
                if (cacheNumbersSorted.length > 1 && cacheNumbersSorted.length != (index + 1)) {
                    pipe = `<label class="number-pipe">|</label>&nbsp&nbsp`
                }
                let numbermWithPipe = `<label class="number">${number}</label>&nbsp&nbsp` + pipe;
                htmlCache = htmlCache + `<div>` + numbermWithPipe + `</div>`;
            })

        htmlCache = `<div class="content-number-cache">` + htmlCache + `</div>`;

        document.getElementById("cache-content").innerHTML = htmlCacheNumbers;
        document.getElementById("cache-content-numbers").innerHTML = htmlCache;
    } else {
        document.querySelector("button").disabled = false;
        document.getElementById("main-content").innerHTML = "Não há mais números";
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
    document.querySelectorAll("button").forEach(button => button.disabled = disable);
}

function isEnableButton() {
    const min = document.getElementById("min").value;
    const max = document.getElementById("max").value;

    return (min != null && max != null && parseInt(min) < parseInt(max));
}

// Listeners
function readSingleFile(e) {
    let file = e.target.files[0];
    if (!file) {
        return;
    }

    var reader = new FileReader();
    reader.onload = function (e) {
        var contents = e.target.result;
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
    } catch (e) {
        participants = []
    }
}

initialContent()
