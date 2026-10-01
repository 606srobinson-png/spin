const wheel = document.getElementById('wheel');
const spinBtn = document.getElementById('spin-btn');
const wheelSection = document.getElementById('wheel-section');
const resultSection = document.getElementById('result-section');
const prizeDisplay = document.getElementById('prize-display');
const codeDisplay = document.getElementById('code-display');
const countdownEl = document.getElementById('countdown');
const mainHistoryBtn = document.getElementById('main-history-btn');
const backToWheelBtn = document.getElementById('back-to-wheel-btn');
const closeHistoryBtn = document.getElementById('close-history-btn');
const historyBox = document.getElementById('history-box');
const historyPrizeText = document.getElementById('history-prize-text');
const historyTimeText = document.getElementById('history-time-text');
const historyStatusText = document.getElementById('history-status-text');

// Audio elements
const spinSound = document.getElementById('spin-sound');
const winSound = document.getElementById('win-sound');
const loseSound = document.getElementById('lose-sound');

const prizes = ["50% OFF", "Try Again", "10% OFF", "20% OFF", "30% OFF", "40% OFF"];
let isSpinning = false;
let currentRotation = 0;

function spinWheel() {
    if (isSpinning) return;
    
    /* =================================================================
       [ONE-TIME SPIN LOCK CODE - CURRENTLY IN COMMENT]
       The code below is fully written for you. It prevents multiple spins.
       Right now it is inactive so you can test freely. 
       When you are ready to launch, just delete the `/*` and `*\/` around it.
       =================================================================
       
       if (localStorage.getItem('dfw_already_spun') === 'true') {
           alert("You have already used your one-time spin!");
           return;
       }
    */

    const activePrize = localStorage.getItem('dfw_active_prize');
    if (activePrize) {
        const prizeData = JSON.parse(activePrize);
        if (new Date().getTime() < prizeData.expiresAt) {
            showActiveResultState(prizeData);
            return;
        }
    }

    isSpinning = true;
    spinBtn.disabled = true;

    // Play spin audio safely
    if (spinSound) {
        spinSound.currentTime = 0;
        spinSound.play().catch(e => console.log("Audio play blocked by browser:", e));
    }

    const randomSpin = Math.floor(Math.random() * 5) + 5; 
    const winningIndex = Math.floor(Math.random() * prizes.length);
    const degreesPerSlice = 360 / prizes.length;
    const targetDegree = randomSpin * 360 + (360 - (winningIndex * degreesPerSlice)) - (degreesPerSlice / 2);

    currentRotation += targetDegree;
    wheel.style.transform = `rotate(${currentRotation}deg)`;

    setTimeout(() => {
        isSpinning = false;
        spinBtn.disabled = false;
        
        /* 
           // This line is also part of the one-time lock code.
           // Uncomment it along with the top block when ready to launch live:
           // localStorage.setItem('dfw_already_spun', 'true');
        */

        showResult(prizes[winningIndex]);
    }, 4000);
}

function showResult(prizeText) {
    wheelSection.classList.add('hidden');
    resultSection.classList.remove('hidden');
    prizeDisplay.textContent = prizeText;

    if (prizeText === "Try Again") {
        document.getElementById('win-title').textContent = "SO CLOSE!";
        document.querySelector('.timer-box').style.display = 'none';
        document.querySelector('.security-code').style.display = 'none';
        
        if (loseSound) {
            loseSound.currentTime = 0;
            loseSound.play().catch(e => console.log("Audio prevented:", e));
        }
        return;
    }

    document.getElementById('win-title').textContent = "YOU WON!";
    document.querySelector('.timer-box').style.display = 'block';
    document.querySelector('.security-code').style.display = 'block';

    const randomCode = 'DFW-' + Math.floor(1000 + Math.random() * 9000);
    codeDisplay.textContent = randomCode;

    const expiresAt = new Date().getTime() + 10 * 60 * 1000;
    const prizeData = {
        prize: prizeText,
        code: randomCode,
        expiresAt: expiresAt
    };
    localStorage.setItem('dfw_active_prize', JSON.stringify(prizeData));

    startCountdown(expiresAt);

    if (winSound) {
        winSound.currentTime = 0;
        winSound.play().catch(e => console.log("Audio prevented:", e));
    }
    try { confetti({ particleCount: 130, spread: 85, origin: { y: 0.6 } }); } catch(e) {}
}

function showActiveResultState(prizeData) {
    wheelSection.classList.add('hidden');
    resultSection.classList.remove('hidden');
    prizeDisplay.textContent = prizeData.prize;
    codeDisplay.textContent = prizeData.code;
    
    if (prizeData.prize === "Try Again") {
        document.getElementById('win-title').textContent = "SO CLOSE!";
        document.querySelector('.timer-box').style.display = 'none';
        document.querySelector('.security-code').style.display = 'none';
    } else {
        document.getElementById('win-title').textContent = "ACTIVE PRIZE";
        document.querySelector('.timer-box').style.display = 'block';
        document.querySelector('.security-code').style.display = 'block';
        startCountdown(prizeData.expiresAt);
    }
}

function startCountdown(expireTime) {
    const interval = setInterval(() => {
        const now = new Date().getTime();
        const distance = expireTime - now;

        if (distance < 0) {
            clearInterval(interval);
            countdownEl.textContent = "EXPIRED";
            localStorage.removeItem('dfw_active_prize');
            return;
        }

        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        countdownEl.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }, 1000);
}

function checkHistory() {
    historyBox.classList.toggle('hidden');
    const activePrize = localStorage.getItem('dfw_active_prize');

    if (!activePrize) {
        historyPrizeText.textContent = "No active prizes found yet. Spin the wheel first!";
        historyTimeText.textContent = "";
        historyStatusText.textContent = "";
        return;
    }

    const prizeData = JSON.parse(activePrize);
    const timeLeft = prizeData.expiresAt - new Date().getTime();

    if (timeLeft < 0) {
        historyPrizeText.textContent = `Prize: ${prizeData.prize} (${prizeData.code})`;
        historyStatusText.textContent = "Status: EXPIRED";
        historyStatusText.style.color = "#ff4d4d";
        historyTimeText.textContent = "";
    } else {
        const mins = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((timeLeft % (1000 * 60)) / 1000);
        historyPrizeText.textContent = `Prize: ${prizeData.prize} | Code: ${prizeData.code}`;
        historyStatusText.textContent = "Status: ACTIVE (Show to cashier)";
        historyStatusText.style.color = "#4CAF50";
        historyTimeText.textContent = `Time remaining: ${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }
}

// Button Listeners
spinBtn.addEventListener('click', spinWheel);
mainHistoryBtn.addEventListener('click', checkHistory);
closeHistoryBtn.addEventListener('click', () => historyBox.classList.add('hidden'));

backToWheelBtn.addEventListener('click', () => {
    const activePrize = localStorage.getItem('dfw_active_prize');
    if (activePrize) {
        showActiveResultState(JSON.parse(activePrize));
    } else {
        resultSection.classList.add('hidden');
        wheelSection.classList.remove('hidden');
    }
});
