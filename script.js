const quoteElement = document.getElementById("quote");

const input = document.getElementById("input");

const timerElement = document.getElementById("timer");

const wpmElement = document.getElementById("wpm");

const accuracyElement = document.getElementById("accuracy");

const progressBar = document.getElementById("progress-bar");

const leaderboardList = document.getElementById("leaderboard-list");

const quotes = [

    "The quick brown fox jumps over the lazy dog.",

    "Practice makes perfect when learning typing.",

    "Technology is shaping the future of humanity.",

    "Typing fast improves productivity and focus.",

    "Success comes through consistency and practice."

];

let currentQuote = "";

let time = 60;

let originalTime = 60;

let timerStarted = false;

let interval;

function loadQuote(){

    currentQuote = quotes[Math.floor(Math.random() * quotes.length)];

    quoteElement.innerHTML = "";

    currentQuote.split("").forEach(char => {

        const span = document.createElement("span");

        span.innerText = char;

        quoteElement.appendChild(span);

    });

    quoteElement.querySelector("span").classList.add("current");

}

loadQuote();

input.addEventListener("input", async () => {

    if(!timerStarted){

        startTimer();

        timerStarted = true;

    }

    const typedText = input.value;

    const quoteChars = quoteElement.querySelectorAll("span");

    let correctChars = 0;

    quoteChars.forEach((charSpan,index) => {

        const typedChar = typedText[index];

        charSpan.classList.remove("current");

        if(typedChar == null){

            charSpan.classList.remove("correct");

            charSpan.classList.remove("incorrect");

            if(index === typedText.length){

                charSpan.classList.add("current");

            }

        }

        else if(typedChar === charSpan.innerText){

            charSpan.classList.add("correct");

            charSpan.classList.remove("incorrect");

            correctChars++;

            if(index === typedText.length){

                charSpan.classList.add("current");

            }

        }

        else{

            charSpan.classList.add("incorrect");

            charSpan.classList.remove("correct");

            if(index === typedText.length){

                charSpan.classList.add("current");

            }

        }

    });

    let wordsTyped = typedText.trim().split(" ").length;

    let wpm = Math.round(wordsTyped / (((originalTime - time) || 1) / 60));

    if(!isFinite(wpm) || wpm < 0){

        wpm = 0;

    }

    wpmElement.innerText = wpm;

    let accuracy = Math.round((correctChars / typedText.length) * 100);

    if(!accuracy){

        accuracy = 100;

    }

    accuracyElement.innerText = accuracy;

    let progress = (typedText.length / currentQuote.length) * 100;

    progressBar.style.width = progress + "%";

    if(progress >= 100){

        clearInterval(interval);

        input.disabled = true;

        try{

            await addDoc(collection(db, "leaderboard"), {

                wpm: wpm,

                accuracy: accuracy,

                created: Date.now()

            });

            loadLeaderboard();

        }

        catch(error){

            console.log(error);

        }

    }

});

function setTimer(seconds){

    time = seconds;

    originalTime = seconds;

    timerElement.innerText = time;

    input.disabled = false;

    input.value = "";

    progressBar.style.width = "0%";

    clearInterval(interval);

    timerStarted = false;

    loadQuote();

    window.location.href = "#typing";

}

function startTimer(){

    interval = setInterval(() => {

        time--;

        timerElement.innerText = time;

        if(time === 0){

            clearInterval(interval);

            input.disabled = true;

            alert("Time Over!");

        }

    },1000);

}

function restartTest(){

    clearInterval(interval);

    timerStarted = false;

    input.disabled = false;

    input.value = "";

    progressBar.style.width = "0%";

    time = originalTime;

    timerElement.innerText = time;

    wpmElement.innerText = 0;

    accuracyElement.innerText = 100;

    loadQuote();

}

async function loadLeaderboard(){

    leaderboardList.innerHTML = "Loading...";

    try{

        const q = query(

            collection(db, "leaderboard"),

            orderBy("wpm", "desc"),

            limit(10)

        );

        const querySnapshot = await getDocs(q);

        leaderboardList.innerHTML = "";

        querySnapshot.forEach((doc) => {

            const data = doc.data();

            leaderboardList.innerHTML += `

                <div class="card">

                    <h3>⚡ ${data.wpm} WPM</h3>

                    <p>🎯 Accuracy: ${data.accuracy}%</p>

                </div>

            `;

        });

    }

    catch(error){

        console.log(error);

    }

}

loadLeaderboard();