const canvas = document.getElementById('wheel');
const ctx = canvas.getContext('2d');
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

// High-contrast, rich colorful wheel segments
const prizes = [
    { text: "50% OFF", color: "#1a1a1a" },
    { text: "Try Again", color: "#b30000" },
    { text: "10% OFF", color: "#1e1e1e" },
    { text: "20% OFF", color: "#2d2d2d" },
    { text: "30% OFF", color: "#161616" },
    { text: "40% OFF", color: "#262626" }
];

const numSegments = prizes.length;
const arcSize = (2 * Math.PI) / numSegments;
let startAngle = 0;
let isSpinning = false;
let currentRotation = 0;

// Draw colorful segments onto the wheel canvas
function drawWheel() {
    const size = 280;
    ctx.clearRect(0, 0, size, size);
    const center = size / 2;
    const radius = center - 6;

    for (let i = 0; i < numSegments; i++) {
        const angle = startAngle + i * arcSize;
        
        // Draw segment slice
        ctx.beginPath();
        ctx.fillStyle = prizes[i].color;
        ctx.moveTo(center, center);
        ctx.arc(center, center, radius, angle, angle + arcSize, false);
        ctx.lineTo(center, center);
        ctx.fill();
        
        // Luxury gold borders between slices
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Draw segment text
        ctx.save();
        ctx.translate(center, center);
        ctx.rotate(angle + arcSize / 2);
        ctx.textAlign = "right";
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 13px 'Montserrat', sans-serif";
        ctx.shadowColor = "rgba(0, 0, 0, 0.9)";
        ctx.shadowBlur = 4;
        ctx.fillText(prizes[i].text, radius - 20, 5);
        ctx.restore();
    }
}

function spinWheel() {
    if (isSpinning) return;
    
    /* =================================================================
       [ONE-TIME SPIN FEATURE - CURRENTLY COMMENTED OUT FOR TESTING]
       Remove `/*` and `*\/` when ready for final website launch.
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

    // Play spin audio
    if (spinSound) {
        spinSound.currentTime = 0;
        spinSound.play().catch(e => console.log("Audio prevented:", e));
    }

    const randomSpin = Math.floor(Math.random() * 5) + 5; 
    const winningIndex = Math.floor(Math.random() * numSegments);
    const degrees = randomSpin * 360 + (360 - (winningIndex * (360 / numSegments))) - (360 / numSegments / 2);

    currentRotation += degrees;
    canvas.style.transition = 'transform 4s cubic-bezier(0.15, 0.90, 0.15, 1)';
    canvas.style.transform = `rotate(${currentRotation}deg)`;

    setTimeout(() => {
        isSpinning = false;
        spinBtn.disabled = false;
        
        /* 
           // Uncomment when launching live:
           // localStorage.setItem('dfw_already_spun', 'true');
        */

        showResult(prizes[winningIndex].text);
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
    confetti({ particleCount: 130, spread: 85, origin: { y: 0.6 } });
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

// Immediately draw wheel on script load
drawWheel();
