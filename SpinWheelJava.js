const canvas = document.getElementById('wheel');
const ctx = canvas.getContext('2d');
const spinBtn = document.getElementById('spin-btn');
const wheelSection = document.getElementById('wheel-section');
const resultSection = document.getElementById('result-section');
const prizeDisplay = document.getElementById('prize-display');
const codeDisplay = document.getElementById('code-display');
const countdownEl = document.getElementById('countdown');
const mainHistoryBtn = document.getElementById('main-history-btn');
const historyBtn = document.getElementById('history-btn');
const historyBox = document.getElementById('history-box');
const historyPrizeText = document.getElementById('history-prize-text');
const historyTimeText = document.getElementById('history-time-text');
const historyStatusText = document.getElementById('history-status-text');

// Exact 6 Segments matching your wheel image layout
const prizes = [
    { text: "50% OFF", color: "#1e1e1e" },
    { text: "Try Again", color: "#b30000" },
    { text: "10% OFF", color: "#1e1e1e" },
    { text: "20% OFF", color: "#333333" },
    { text: "30% OFF", color: "#1e1e1e" },
    { text: "40% OFF", color: "#333333" }
];

const numSegments = prizes.length;
const arcSize = (2 * Math.PI) / numSegments;
let startAngle = 0;
let isSpinning = false;
let currentRotation = 0;

function drawWheel() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const center = canvas.width / 2;
    const radius = center - 5;

    for (let i = 0; i < numSegments; i++) {
        const angle = startAngle + i * arcSize;
        
        ctx.beginPath();
        ctx.fillStyle = prizes[i].color;
        ctx.moveTo(center, center);
        ctx.arc(center, center, radius, angle, angle + arcSize, false);
        ctx.lineTo(center, center);
        ctx.fill();
        ctx.strokeStyle = '#d4af37';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.save();
        ctx.translate(center, center);
        ctx.rotate(angle + arcSize / 2);
        ctx.textAlign = "right";
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 13px 'Montserrat', sans-serif";
        ctx.fillText(prizes[i].text, radius - 20, 5);
        ctx.restore();
    }
}

function spinWheel() {
    if (isSpinning) return;
    
    /* 
      =================================================================
      ONE-TIME SPIN FEATURE (Currently Disabled / Commented Out)
      To activate permanent one-time spin per user/device later, 
      uncomment the block below:
      =================================================================
      
      if (localStorage.getItem('dfw_already_spun') === 'true') {
          alert("You have already used your one-time spin!");
          return;
      }
      */

    // Checks if user has an active prize already running
    const activePrize = localStorage.getItem('dfw_active_prize');
    if (activePrize) {
        const prizeData = JSON.parse(activePrize);
        if (new Date().getTime() < prizeData.expiresAt) {
            alert("You already have an active prize! Check your active prize below.");
            return;
        }
    }

    isSpinning = true;
    spinBtn.disabled = true;

    // Random spins + random target slice
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
          // Uncomment this line later to lock the spin permanently after winning:
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
        return;
    }

    document.getElementById('win-title').textContent = "YOU WON!";
    document.querySelector('.timer-box').style.display = 'block';
    document.querySelector('.security-code').style.display = 'block';

    const randomCode = 'DFW-' + Math.floor(1000 + Math.random() * 9000);
    codeDisplay.textContent = randomCode;

    const expiresAt = new Date().getTime() + 10 * 60 * 1000; // 10 minutes
    const prizeData = {
        prize: prizeText,
        code: randomCode,
        expiresAt: expiresAt
    };
    localStorage.setItem('dfw_active_prize', JSON.stringify(prizeData));

    startCountdown(expiresAt);
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
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
        historyPrizeText.textContent = "No active prizes found.";
        historyTimeText.textContent = "";
        historyStatusText.textContent = "";
        return;
    }

    const prizeData = JSON.parse(activePrize);
    const timeLeft = prizeData.expiresAt - new Date().getTime();

    if (timeLeft < 0) {
        historyPrizeText.textContent = `Previous Prize: ${prizeData.prize} (${prizeData.code})`;
        historyStatusText.textContent = "Status: EXPIRED";
        historyStatusText.style.color = "#ff4d4d";
        historyTimeText.textContent = "";
    } else {
        const mins = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((timeLeft % (1000 * 60)) / 1000);
        historyPrizeText.textContent = `Active Prize: ${prizeData.prize} | Code: ${prizeData.code}`;
        historyStatusText.textContent = "Status: ACTIVE (Show to cashier)";
        historyStatusText.style.color = "#4CAF50";
        historyTimeText.textContent = `Time remaining: ${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }
}

spinBtn.addEventListener('click', spinWheel);
mainHistoryBtn.addEventListener('click', checkHistory);
historyBtn.addEventListener('click', checkHistory);

// Initialize wheel canvas drawing
drawWheel();
