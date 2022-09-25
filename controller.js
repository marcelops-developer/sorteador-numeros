const htmlInputs = `
            Entre&nbsp;
            <input id="min" oninput='validate(event)' class="enters" type="text" />
            &nbsp;e&nbsp;
            <input id="max" oninput='validate(event)' class="enters" type="text" />`
    const htmlButtonStart = `<button id="random-button" onclick="startRandom()" disabled>Sortear</button>`

    const htmlNumber = `
        <div id="random-content">
            <label id="random-number"></label>
        </div>`
    const htmlButtonStop = `
    <button onclick="back()">Limpar</button>
    <button onclick="startRandom()">Sortear Novamente</button>`

    const htmlCacheNumbers = `
            <div id="cache-content">
                <div id="cache-item">
                    <h2>Números Sorteados</h2>
                    <div id="cache-content-numbers"></div>
                <div>
            <div>`

    let intervalControler;
    let timeoutControler;
    let cacheNumbersSorted = []
    let rangeNumbers = [];

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
                    document.getElementById("random-number").innerHTML = numberSorted;
                    resolve(numberSorted)
                } catch (e) {
                    reject()
                }
            }, 3 * 1000));

    let MIN = null;
    let MAX = null;
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

        disableButton(true);

        intervalControler = intervalRandom();
        timeoutControler = await getRandomNumber()
            .then((numberSorted) => {
                initConfetti(numberSorted);
            })
            .catch(() => {
                console.log("Erro ao buscar número aleatório")
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
            cacheNumbersSorted.reverse().forEach((number) => {
                htmlCache = htmlCache + `<p class="number">${number}</p>`;
            })

            document.getElementById("cache-content").innerHTML = htmlCacheNumbers;
            document.getElementById("cache-content-numbers").innerHTML = htmlCache;
        } else {
            document.querySelector("button").disabled = false;
            document.getElementById("main-content").innerHTML = "Não há mais números";
        }

    }

    function clearCacheNumbersSorted() {
        cacheNumbersSorted = []
    }

    function back() {
        clearCacheNumbersSorted()
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
    }

    function validate(evt) {
        if (evt.target.value) {
            let newInputValueMatch = evt.target.value.match(/\d+/g);
            let newValue = "";

            if (newInputValueMatch != null) {
                newValue = newInputValueMatch.join('');
            }

            evt.target.value = newValue
        }

        if (isEnableButton()) {
            disableButton(false);
        } else {
            disableButton(true);
        }
    }

    function disableButton(disable) {
        document.querySelectorAll("button").forEach(button => button.disabled = disable);
    }

    function isEnableButton() {
        const min = document.getElementById("min").value;
        const max = document.getElementById("max").value;

        return (min != null && max != null && parseInt(min) < parseInt(max));
    }

    initialContent()