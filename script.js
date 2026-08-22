const sky = document.getElementById('sky');
const celestialBody = document.getElementById('celestial-body');
const fireworksCanvas = document.getElementById('fireworks-canvas');
const ctx = fireworksCanvas.getContext('2d');
const flyingContainer = document.getElementById('flying-container');
const previewBtn = document.getElementById('preview-btn');
const resetBtn = document.getElementById('reset-btn');
const localTimeDisplay = document.getElementById('local-time');

let particles = [];
let isPreviewMode = false;
let targetYear = 2026;
let targetDate = new Date(`January 1, ${targetYear} 00:00:00`).getTime();

// --- Persistence Check ---
const savedSimulation = localStorage.getItem('simulatedNewYear');
if (savedSimulation) {
    const simTime = parseInt(savedSimulation, 10);
    const now = new Date().getTime();
    // 24 hours in ms = 86400000
    if (now - simTime < 86400000) {
        targetDate = simTime;
    } else {
        localStorage.removeItem('simulatedNewYear');
    }
}

// --- Countdown Logic ---
function updateCountdown() {
    let now = new Date().getTime();

    // If preview mode is off, perform normal logic checks
    if (!isPreviewMode) {
        const celebrationEnd = targetDate + (24 * 60 * 60 * 1000); // 24 hours after midnight

        // CHECK: Are we in the 24-hour celebration window?
        if (now >= targetDate && now < celebrationEnd) {
            // We are in celebration mode!
            triggerCelebration(now);
            return;
        } else if (now >= celebrationEnd) {
            // Celebration is over, reset for next year
            targetYear++;
            targetDate = new Date(`January 1, ${targetYear} 00:00:00`).getTime();
            // Reset UI
            document.querySelector('.title').textContent = "New Year's Eve Countdown";
            document.querySelector('.title').classList.remove('celebrate');
            document.getElementById('timer').classList.remove('celebrate');
            // Allow sky to be dynamic again
        }
    } else {
        // In preview mode... handled by interval, but if it finishes, we stay in celebration state
        // until user refreshes or we explicitly reset.
        return;
    }

    // Normal Countdown Calculation
    const distance = targetDate - now;

    // Safety check just in case
    if (distance <= 0 && !isPreviewMode) {
        // Should have been caught by celebration window check, but if we are EXACTLY at 0 or just passed...
        triggerCelebration(now);
        return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    document.getElementById('days').textContent = String(days).padStart(2, '0');
    document.getElementById('hours').textContent = String(hours).padStart(2, '0');
    document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
    document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
}

function triggerCelebration(now) {
    document.querySelector('.title').textContent = "Happy New Year!";
    document.querySelector('.title').classList.add('celebrate');
    document.querySelector('.year-label').textContent = targetYear;
    document.getElementById('timer').classList.add('celebrate');

    // Count UP logic
    const timeSince = now - targetDate;
    const days = Math.floor(timeSince / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeSince % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeSince % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeSince % (1000 * 60)) / 1000);

    document.getElementById('days').textContent = String(days).padStart(2, '0');
    document.getElementById('hours').textContent = String(hours).padStart(2, '0');
    document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
    document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');

    // Force night mode for celebration if not already
    if (!sky.classList.contains('night')) {
        updateSky(0);
    }

    startFireworks();
}

// --- Local Time & Extra Clocks ---
function updateLocalTime() {
    const now = new Date();
    localTimeDisplay.textContent = now.toLocaleTimeString('en-US', { hour12: false });
}

setInterval(() => {
    updateCountdown();
    updateLocalTime();
}, 1000);


// --- Dynamic Sky & Flying Entities Logic ---
function updateSky(forceHour = null) {
    const now = new Date();
    let hour = forceHour !== null ? forceHour : now.getHours();

    // Override: If we are in celebration mode, FORCE NIGHT
    if (!isPreviewMode && now >= targetDate && now < (targetDate + 24 * 60 * 60 * 1000)) {
        hour = 0; // Midnight
    }

    sky.className = 'sky-container'; // reset

    if (hour >= 6 && hour < 17) {
        // Day
        const progress = (hour - 6) / 11;
        const x = progress * 100;
        celestialBody.style.left = `${x}%`;
        celestialBody.style.top = '15%';
        celestialBody.style.background = '#ffaa00';
        celestialBody.style.boxShadow = '0 0 40px #ffaa00';

        if (Math.random() < 0.3) spawnEntity('seagull');
        if (Math.random() < 0.3) spawnSceneEntity('boat');
    } else if (hour >= 17 && hour < 20) {
        // Sunset
        sky.classList.add('sunset');
        celestialBody.style.left = '90%';
        celestialBody.style.top = '60%';
        celestialBody.style.background = '#ff7e5f';
        celestialBody.style.boxShadow = '0 0 40px #ff7e5f';
        if (Math.random() < 0.2) spawnSceneEntity('boat');
    } else {
        // Night
        sky.classList.add('night');
        celestialBody.style.left = '50%';
        celestialBody.style.top = '15%';
        celestialBody.style.background = '#fdfbf7';
        celestialBody.style.boxShadow = '0 0 20px #fdfbf7, 0 0 60px rgba(255, 255, 255, 0.4)';

        if (Math.random() < 0.3) spawnEntity('ufo');
    }

    // Random chance for critters
    if (Math.random() < 0.3) spawnSceneEntity('crab');
    if (Math.random() < 0.1) spawnSceneEntity('shark');
}

// Flying Entity Spawner (Sky)
function spawnEntity(type) {
    if (flyingContainer.childElementCount > 3) return;

    const entity = document.createElement('div');
    entity.className = 'flying-entity';

    if (type === 'seagull') {
        entity.textContent = '🕊️';
        entity.style.animationDuration = (15 + Math.random() * 10) + 's';
        entity.style.top = (10 + Math.random() * 40) + '%';
    } else if (type === 'ufo') {
        entity.textContent = '🛸';
        entity.style.animationDuration = (8 + Math.random() * 5) + 's';
        entity.style.top = (5 + Math.random() * 30) + '%';
    }

    flyingContainer.appendChild(entity);

    setTimeout(() => {
        if (entity.parentNode) entity.parentNode.removeChild(entity);
    }, 25000);
}

// Scene Helper
const sceneEntities = document.getElementById('scene-entities');
function spawnSceneEntity(type) {
    if (!sceneEntities) return;
    const existing = sceneEntities.querySelectorAll(`.entity-${type}`);
    if (existing.length > 0) return;

    const entity = document.createElement('div');
    entity.className = `entity-${type}`;

    if (type === 'crab') {
        entity.textContent = '🦀';
        entity.style.left = (Math.random() * 80 + 10) + '%';
    } else if (type === 'shark') {
        entity.textContent = '🦈';
        entity.style.left = '-10%';
        setTimeout(() => { entity.style.left = '110%'; }, 100);
    } else if (type === 'boat') {
        entity.textContent = '🚢';
        entity.style.left = '-20%';
        setTimeout(() => { entity.style.left = '120%'; }, 100);
    } else if (type === 'surfer') {
        entity.textContent = '🏄';
        entity.style.left = '-10%';
        setTimeout(() => { entity.style.left = '110%'; }, 50); // Faster than boat
    }

    sceneEntities.appendChild(entity);

    let lifetime = 60000;
    if (type === 'crab') lifetime = 5000;
    if (type === 'surfer') lifetime = 20000;

    setTimeout(() => {
        if (entity.parentNode) entity.parentNode.removeChild(entity);
    }, lifetime);
}

// Update sky every minute
setInterval(() => updateSky(), 60000);
updateSky();

// --- Preview Mode ---
previewBtn.addEventListener('click', () => {
    if (isPreviewMode) return;
    isPreviewMode = true;

    // Force night mode
    updateSky(0);

    let previewSeconds = 5;
    const previewInterval = setInterval(() => {
        document.getElementById('days').textContent = "00";
        document.getElementById('hours').textContent = "00";
        document.getElementById('minutes').textContent = "00";
        document.getElementById('seconds').textContent = String(previewSeconds).padStart(2, '0');

        if (previewSeconds <= 0) {
            clearInterval(previewInterval);

            // Turn off preview mode flag
            // AND set the target date to NOW so the main loop starts counting UP immediately
            const mockMidnight = new Date().getTime();
            targetDate = mockMidnight;
            isPreviewMode = false;

            // PERSIST IT:
            localStorage.setItem('simulatedNewYear', mockMidnight);

            // Force sky update again just in case
            updateSky(0);

            // The main loop (setInterval) will next run (within 1s) and see distance <= 0
            // and trigger the "Happy New Year" logic + fireworks.
            // We manually trigger fireworks here just to be instant
            startFireworks();
        }
        previewSeconds--;
    }, 1000);
});

resetBtn.addEventListener('click', () => {
    isPreviewMode = false;
    localStorage.removeItem('simulatedNewYear');
    targetYear = 2026;
    targetDate = new Date(`January 1, ${targetYear} 00:00:00`).getTime();

    // Reset UI
    document.querySelector('.title').textContent = "New Year's Eve Countdown";
    document.querySelector('.title').classList.remove('celebrate');
    document.getElementById('timer').classList.remove('celebrate');

    updateSky(); // Will reset to current time
});


// --- Epic Fireworks Logic ---
function resizeCanvas() {
    fireworksCanvas.width = window.innerWidth;
    fireworksCanvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function Particle(x, y, color) {
    this.x = x;
    this.y = y;
    this.color = color;
    // Explosion burst velocity
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 6 + 2;
    this.velocity = {
        x: Math.cos(angle) * speed,
        y: Math.sin(angle) * speed
    };
    this.alpha = 1;
    this.friction = 0.96;
    this.gravity = 0.05; // Make them float a bit more
    this.decay = Math.random() * 0.015 + 0.005;
}

Particle.prototype.draw = function () {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.beginPath();
    ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.shadowBlur = 10;
    ctx.shadowColor = this.color;
    ctx.fill();
    ctx.restore();
};

Particle.prototype.update = function () {
    this.velocity.x *= this.friction;
    this.velocity.y *= this.friction;
    this.velocity.y += this.gravity;
    this.x += this.velocity.x;
    this.y += this.velocity.y;
    this.alpha -= this.decay;
};

let fireworksActive = false;

function startFireworks() {
    if (fireworksActive) return;
    fireworksActive = true;
    animateFireworks();
}

function createFirework() {
    const x = Math.random() * fireworksCanvas.width;
    const y = Math.random() * (fireworksCanvas.height * 0.6);
    const hue = Math.floor(Math.random() * 360);
    const color = `hsl(${hue}, 100%, 60%)`;

    for (let i = 0; i < 150; i++) {
        particles.push(new Particle(x, y, color));
    }
}

function animateFireworks() {
    requestAnimationFrame(animateFireworks);

    // Trail effect
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, fireworksCanvas.width, fireworksCanvas.height);
    ctx.globalCompositeOperation = 'source-over';

    particles.forEach((particle, index) => {
        if (particle.alpha > 0) {
            particle.update();
            particle.draw();
        } else {
            particles.splice(index, 1);
        }
    });

    if (particles.length < 1000 && Math.random() < 0.1) {
        createFirework();
    }
}

// For testing purposes, uncomment to start immediately
// startFireworks();
