// ==========================================
// DFW SMOKE & VAPOR SHOP - SPIN WHEEL JAVASCRIPT
// ==========================================

// Prizes configuration matching your wheel sectors
const prizes = [
    { text: "10% OFF", color: "#111111", textColor: "#ffd700" },
    { text: "15% OFF", color: "#d4af37", textColor: "#000000" },
    { text: "FREE GIFT", color: "#111111", textColor: "#ffd700" },
    { text: "5% OFF", color: "#222222", textColor: "#ffffff" },
    { text: "20% OFF", color: "#d4af37", textColor: "#000000" },
    { text: "TRY AGAIN", color: "#111111", textColor: "#ff4d4d" }
];

const canvas = document.getElementById('wheel');
const ctx = canvas.getContext('2d');
let isSpinning = false;

// Draw the wheel on page load
window.onload = function() {
    drawWheel();
    checkExistingPrize();
};

function drawWheel() {
    const numSectors = prizes.length;
    const arcSize = (2 * Math.PI) / numSectors;
    const center = canvas.width / 2;
    const radius = center - 5;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < numSectors; i++) {
        const angle = i * arcSize;

        // Draw Sector
        ctx.beginPath();
        ctx.fillStyle = prizes[i].color;
        ctx.moveTo(center, center);
        ctx.arc(center, center, radius, angle, angle + arcSize);
        ctx.lineTo(center, center);
        ctx.fill();
        
        // Sector Border
        ctx.strokeStyle = '#d4af37';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw Text
        ctx.save();
        ctx.translate(center, center);
        ctx.rotate(angle + arcSize / 2);
        ctx.textAlign = "right";
        ctx.fillStyle = prizes[i].textColor;
        ctx.font = "bold 14px 'Montserrat', sans-serif";
        ctx.fillText(prizes[i].text, radius - 20, 6);
        ctx.restore();
    }
}

function spinWheel() {
    if (isSpinning) return;

    /* 
      ==================================================================
      NOTE FOR ONE-TIME USE:
      Currently, the once-per-day restriction is disabled for testing.
      AFTER you check the website and confirm everything works, uncomment 
      the block below to enforce the 1-spin-per-day rule:
      
      const lastSpin = localStorage.getItem('dfw_last_spin');
      const today = new Date().toDateString();
      if (lastSpin === today) {
          alert("You have already spun the wheel today! Please check your active prize.");
          showHistory();
          return;
      }
      ==================================================================
    */

    isSpinning = true;
    const spinBtn = document.getElementById('spin-btn');
    spinBtn.disabled = true;

    // Hide previous results while spinning
    document.getElementById('result-section').classList.add('hidden');
    document.getElementById('history-box').classList.add('hidden');

    // Calculate rotation (Minimum 5 full spins + random offset)
    const minSpins = 5;
    const extraDegrees = Math.floor(Math.random() * 360);
    const totalDegrees = (minSpins * 360) + extraDegrees;

    // Apply rotation transition matching the 4-second CSS timing
    canvas.style.transition = "transform 4s cubic-bezier(0.15, 0.9, 0.2, 1)";
    canvas.style.transform = `rotate(${totalDegrees}deg)`;

    // Wait exactly 4 seconds for the wheel to stop completely before showing results
    setTimeout(() => {
        canvas.style.transition = 'none';
        const normalizedDegree = totalDegrees % 360;
        canvas.style.transform = `rotate(${normalizedDegree}deg)`;

        // Determine winning prize based on final angle
        const winningPrize = determineWinner(normalizedDegree);
        
        // Save spin data
        savePrize(winningPrize);

        // Trigger victory effects
        triggerWin(winningPrize);

        isSpinning = false;
        spinBtn.disabled = false;
    }, 4000);
}

function determineWinner(deg) {
    const sectorAngle = 360 / prizes.length;
    // Adjust for pointer position at the top (-90 degrees offset)
    let adjustedDeg = (360 - (deg % 360) + 270) % 360;
    const winningIndex = Math.floor(adjustedDeg / sectorAngle);
    return prizes[winningIndex].text;
}

function savePrize(prizeText) {
    const now = new Date();
    const prizeData = {
        prize: prizeText,
        time: now.getTime(),
        dateString: now.toDateString(),
        code: "DFW-" + Math.floor(1000 + Math.random() * 9000)
    };
    
    localStorage.setItem('dfw_active_prize', JSON.stringify(prizeData));
    
    /* 
      Once-per-day storage tracker (uncomment alongside the check above later):
      localStorage.setItem('dfw_last_spin', now.toDateString());
    */
}

function triggerWin(prizeText) {
    // Play Confetti
    if (typeof confetti === 'function') {
        confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.6 }
        });
    }

    // Update UI elements
    document.getElementById('prize-display').innerText = prizeText;
    document.getElementById('live-code').innerText = "DFW-" + Math.floor(1000 + Math.random() * 9000);
    document.getElementById('result-section').classList.remove('hidden');

    // Start 10-minute countdown timer
    startCountdown(10 * 60);
}

function startCountdown(duration) {
    let timer = duration, minutes, seconds;
    const display = document.getElementById('countdown');
    
    // Clear any existing interval if running
    if (window.countdownInterval) clearInterval(window.countdownInterval);

    window.countdownInterval = setInterval(() => {
        minutes = parseInt(timer / 60, 10);
        seconds = parseInt(timer % 60, 10);

        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        display.textContent = minutes + ":" + seconds;

        if (--timer < 0) {
            clearInterval(window.countdownInterval);
            display.textContent = "EXPIRED";
            document.getElementById('live-code').innerText = "EXPIRED";
        }
    }, 1000);
}

function showHistory() {
    const historyBox = document.getElementById('history-box');
    const savedData = localStorage.getItem('dfw_active_prize');

    if (!savedData) {
        document.getElementById('history-prize').innerText = "No active prize found. Spin the wheel!";
        document.getElementById('history-time').innerText = "";
        document.getElementById('history-status').innerText = "";
    } else {
        const data = JSON.parse(savedData);
        const elapsedMinutes = Math.floor((new Date().getTime() - data.time) / 1000 / 60);
        
        document.getElementById('history-prize').innerText = data.prize + " (Code: " + data.code + ")";
        document.getElementById('history-time').innerText = "Won on: " + new Date(data.time).toLocaleTimeString();
        
        if (elapsedMinutes > 10) {
            document.getElementById('history-status').innerText = "Status: EXPIRED (>10 mins passed)";
            document.getElementById('history-status').style.color = "#ff4d4d";
        } else {
            document.getElementById('history-status').innerText = "Status: ACTIVE (" + (10 - elapsedMinutes) + " mins remaining)";
            document.getElementById('history-status').style.color = "#4CAF50";
        }
    }

    historyBox.classList.toggle('hidden');
}

function checkExistingPrize() {
    const savedData = localStorage.getItem('dfw_active_prize');
    if (savedData) {
        const data = JSON.parse(savedData);
        const elapsedSeconds = (new Date().getTime() - data.time) / 1000;
        
        // If within 10 minutes, restore the active screen state
        if (elapsedSeconds < 600) {
            document.getElementById('prize-display').innerText = data.prize;
            document.getElementById('live-code').innerText = data.code;
            document.getElementById('result-section').classList.remove('hidden');
            startCountdown(Math.floor(600 - elapsedSeconds));
        }
    }
}
