const wheel = document.getElementById('wheel');
const spinBtn = document.getElementById('spin-btn');
const wheelSection = document.getElementById('wheel-section');
const resultSection = document.getElementById('result-section');
const prizeDisplay = document.getElementById('prize-display');
const codeDisplay = document.getElementById('code-display');
const countdownEl = document.getElementById('countdown');
const mainHistoryBtn = document.getElementById('main-history-btn');
const backToWheelBtn = document.getElementById('back-to-wheel-btn');

// Audio elements
const spinSound = document.getElementById('spin-sound');
const winSound = document.getElementById('win-sound');
const loseSound = document.getElementById('lose-sound');

// Wheel configuration (6 slices, 60 degrees each)
// Order matching conic gradient clockwise from top: 
// 0: 50% OFF, 1: Try Again, 2: 10% OFF, 3: 20% OFF, 4: 30% OFF, 5: 40% OFF
const prizes = ["50% OFF", "Try Again", "10% OFF", "20% OFF", "30% OFF", "40% OFF"];
let isSpinning = false;
let currentRotation = 0;

// CLEAR LOCALSTORAGE ON LOAD FOR DEVELOPER CONVENIENCE
// This guarantees refreshing the page always puts you back at a clean slate ready to spin!
window.addEventListener('DOMContentLoaded', () => {
    localStorage.removeItem('dfw_active_prize');
    localStorage.removeItem('dfw_already_spun');
});

function spinWheel() {
    if (isSpinning) return;
    isSpinning = true;
    spinBtn.disabled = true;

    if (spinSound) {
        spinSound.currentTime = 0;
        spinSound.play().catch(e => console.log("Audio play blocked:", e));
    }

    // Pick random winning index
    const winningIndex = Math.floor(Math.random() * prizes.length);
    const degreesPerSlice = 360 / prizes.length; // 60 degrees

    // Math to land pointer dead-center on the chosen slice segment
    // Each slice center relative to rotation: index * 60 + 30
    const extraSpins = 360 * 6; // 6 full dramatic rotations
    const targetSliceAngle = winningIndex * degreesPerSlice + (degreesPerSlice / 2);
    
    // Calculate final absolute rotation angle
    const totalRotation = currentRotation + extraSpins + (360 - (currentRotation % 360)) + (360 - targetSliceAngle);
    
    currentRotation = totalRotation;
    wheel.style.transform = `rotate(${currentRotation}deg)`;

    // Wait for CSS transition to finish (4.5 seconds)
    setTimeout(() => {
        isSpinning = false;
        spinBtn.disabled = false;
        showResult(prizes[winningIndex]);
    }, 4500);
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

    startCountdown(new Date().getTime() + 10 * 60 * 1000);

    if (winSound) {
        winSound.currentTime = 0;
        winSound.play().catch(e => console.log("Audio prevented:", e));
    }
    try { confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 } }); } catch(e) {}
}

function startCountdown(expireTime) {
    const interval = setInterval(() => {
        const now = new Date().getTime();
        const distance = expireTime - now;

        if (distance < 0) {
            clearInterval(interval);
            countdownEl.textContent = "EXPIRED";
            return;
        }

        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        countdownEl.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }, 1000);
}

// Button Listeners for Developer Testing
spinBtn.addEventListener('click', spinWheel);

// Clear state / Reset button
mainHistoryBtn.addEventListener('click', () => {
    localStorage.clear();
    location.reload();
});

backToWheelBtn.addEventListener('click', () => {
    resultSection.classList.add('hidden');
    wheelSection.classList.remove('hidden');
});
