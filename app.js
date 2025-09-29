// Инициализация Telegram WebApp
if (window.Telegram && window.Telegram.WebApp) {
    window.Telegram.WebApp.ready();
    window.Telegram.WebApp.expand();
    window.Telegram.WebApp.disableVerticalSwipes();
}

// --- СИСТЕМА ЧАСТИЦ ---
let particles = [];
function createParticleBurst(coords, color) {
    coords.forEach(coord => {
        const pos = getStarPosition(coord);
        for (let i = 0; i < 30; i++) {
            particles.push({
                x: pos.x, y: pos.y, vx: (Math.random() - 0.5) * 4, vy: (Math.random() - 0.5) * 4,
                life: 1 + Math.random() * 0.8, color: color
            });
        }
    });
}
function createPowerfulBurst(centerX, centerY, color) {
    for (let i = 0; i < 100; i++) {
        particles.push({
            x: centerX, y: centerY, vx: (Math.random() - 0.5) * 10, vy: (Math.random() - 0.5) * 10,
            life: 1.5 + Math.random() * 1.0, color: color
        });
    }
}

// --- ДАННЫЕ ИГРЫ ---
const gameData = {
    whaleBetaCoords: [
        { x: 0.631, y: 0.446, jump: true }, { x: 0.631, y: 0.497 }, { x: 0.652, y: 0.495 }, { x: 0.685, y: 0.433 },
        { x: 0.721, y: 0.380 }, { x: 0.743, y: 0.375 }, { x: 0.736, y: 0.453 }, { x: 0.706, y: 0.557 },
        { x: 0.666, y: 0.645 }, { x: 0.665, y: 0.741 }, { x: 0.637, y: 0.814 }, { x: 0.628, y: 0.694 },
        { x: 0.561, y: 0.734 }, { x: 0.580, y: 0.664 }, { x: 0.594, y: 0.554, jump: true }, { x: 0.559, y: 0.741 },
        { x: 0.527, y: 0.794 }, { x: 0.477, y: 0.824 }, { x: 0.513, y: 0.736, jump: true }, { x: 0.558, y: 0.585 },
        { x: 0.541, y: 0.614 }, { x: 0.525, y: 0.669, jump: true }, { x: 0.391, y: 0.594 }, { x: 0.431, y: 0.649 },
        { x: 0.480, y: 0.672 }, { x: 0.524, y: 0.667 }, { x: 0.512, y: 0.737 }, { x: 0.465, y: 0.712 },
        { x: 0.418, y: 0.657 }, { x: 0.362, y: 0.520 }, { x: 0.340, y: 0.411 }, { x: 0.321, y: 0.339 },
        { x: 0.277, y: 0.303 }, { x: 0.253, y: 0.226 }, { x: 0.248, y: 0.164 }, { x: 0.273, y: 0.206 },
        { x: 0.306, y: 0.221 }, { x: 0.340, y: 0.286 }, { x: 0.358, y: 0.221 }, { x: 0.384, y: 0.189 },
        { x: 0.394, y: 0.142 }, { x: 0.400, y: 0.216 }, { x: 0.390, y: 0.283 }, { x: 0.357, y: 0.356 },
        { x: 0.396, y: 0.441 }, { x: 0.448, y: 0.478 }, { x: 0.516, y: 0.457 }, { x: 0.570, y: 0.406 },
        { x: 0.633, y: 0.349 }, { x: 0.698, y: 0.323 }, { x: 0.723, y: 0.334 }, { x: 0.744, y: 0.376 }
    ]
};

// --- ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ---
let canvas, ctx;
let width, height;
let gameState = 'intro';
let currentStarIndex = 0;
let drawnLines = [], backgroundStars = [], cursorTrail = [], shootingStars = [];
let whaleImages = {};
let animationTime = 0, nebulaOffset = 0;
let whaleSong, ambientMusic;
let isEasterEggRevealed = false;
let wishBubbleFirstClickDone = false;

let currentDialogueIndex = -1; // -1 означает, что диалог еще не начался
let dialogueLines = [ // Весь твой диалог
    { speaker: 'alpha', text: 'У инч кспасэс? (жми)' },
    { speaker: 'beta', text: 'Խաղի կանոնները (жми)' },
    { speaker: 'alpha', text: 'հերիք չէ՞ր (սխմե)' },
    { speaker: 'beta', text: 'Խա-ղի կա-նոն-նե-րը!😈 (սխմե)' },
    { speaker: 'alpha', text: '... Держись! Прыгаем... (жми)' },
    { speaker: 'alpha', text: '...Плюх! Мы на другой ветке уже (жми)' },
    { speaker: 'beta', text: 'Воч ми хах? Ну ладно... (жми)' },
    { speaker: 'beta', text: '... А можно я? (жми)' },
    { speaker: 'alpha', text: 'что ты?' },
    { speaker: 'beta', text: 'тоже "Плюх!" хочу сделать' },
    { speaker: 'alpha', text: 'Хмм... Можно)...' },
    { speaker: 'alpha', text: '...О, нет! Только не туда!' },
    { speaker: 'beta', text: 'Բռնվի, Ստյոպ! հմի կթռնինք' },
    { speaker: 'alpha', text: 'Գայանե, փորձ կատա․․․' },
    { speaker: 'alpha', text: 'ааааааааааааааааааааа' },
    { speaker: 'beta', text: 'юхуууууууу' },
    { speaker: 'alpha', text: 'Шмяк!' },
    { speaker: 'beta', text: 'Плюх!' },
    { speaker: 'alpha', text: 'ел врицс, лхджир!' },
    { speaker: 'alpha', text: 'ахахаха (жми)' },
    { speaker: 'beta', text: 'хохохехехаха (жми)' }
];

// --- ИНИЦИАЛИЗАЦИЯ ---
window.addEventListener('load', init);
window.addEventListener('resize', resize);

// ЗАМЕНИ СВОЮ ФУНКЦИЮ init НА ЭТУ ВЕРСИЮ:

function init() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    whaleSong = document.getElementById('whaleSong');
    ambientMusic = document.getElementById('ambientMusic');
    whaleSong.loop = true;

    const introBubble = document.getElementById('introBubble');
    const startButton = document.getElementById('startButton');
    const easterEggBubble = document.getElementById('easterEggBubble');
    const easterEggInitial = document.getElementById('easterEggInitial');
    const easterEggRevealed = document.getElementById('easterEggRevealed');
    const wishBubble = document.getElementById('wishBubble');
    const wishText = document.getElementById('wishText');
    const turnBubble = document.getElementById('turnBubble');
    
    const dialogueAlphaBubble = document.getElementById('dialogueAlphaBubble');
    const dialogueAlphaTextSpan = dialogueAlphaBubble.querySelector('span');
    const dialogueBetaBubble = document.getElementById('dialogueBetaBubble');
    const dialogueBetaTextSpan = dialogueBetaBubble.querySelector('span');
    
    // ===== НОВЫЕ ЭЛЕМЕНТЫ =====
    const theEndButton = document.getElementById('theEndButton');
    const finalModal = document.getElementById('finalModal');

    // --- ОБРАБОТЧИКИ UI ЭЛЕМЕНТОВ ---

    startButton.addEventListener('click', () => {
        introBubble.classList.add('hidden');
        gameState = 'drawing';
        easterEggBubble.classList.remove('hidden');
        gameLoop();
    });

    easterEggBubble.addEventListener('click', () => {
        if (!isEasterEggRevealed) {
            easterEggInitial.classList.add('hidden');
            easterEggRevealed.classList.remove('hidden');
            easterEggBubble.classList.add('revealed');
            isEasterEggRevealed = true;
        } else {
            easterEggBubble.classList.add('hidden');
        }
    });

    wishBubble.addEventListener('click', () => {
        if (!wishBubbleFirstClickDone) {
            wishText.textContent = 'Гаянэ, стой! Погоди! Ты же успела загадать желание? Если нет, то закрой глаза и сделай это))) (жми)';
            wishBubbleFirstClickDone = true;
        } else {
            wishBubble.classList.add('hidden');
            gameState = 'drawing';
        }
    });
    
    turnBubble.addEventListener('click', () => {
        turnBubble.classList.add('hidden');
        setTimeout(() => {
            currentDialogueIndex = 0;
            updateDialogueBubble();
        }, 2000);
    });

    function handleDialogueClick() {
        if (currentDialogueIndex < 0) return;
        
        const currentSpeaker = dialogueLines[currentDialogueIndex].speaker;
        if (currentSpeaker === 'alpha') {
            dialogueAlphaBubble.classList.add('hidden');
        } else {
            dialogueBetaBubble.classList.add('hidden');
        }
        currentDialogueIndex++;
        updateDialogueBubble();
    }

    dialogueAlphaBubble.addEventListener('click', handleDialogueClick);
    dialogueBetaBubble.addEventListener('click', handleDialogueClick);
    
    // ===== НОВЫЙ ОБРАБОТЧИК ДЛЯ КНОПКИ "THE END" =====
    theEndButton.addEventListener('click', () => {
        theEndButton.classList.add('hidden');
        finalModal.classList.remove('hidden');
        
        setTimeout(() => {
            if (window.Telegram && window.Telegram.WebApp) {
                window.Telegram.WebApp.close();
            } else {
                alert('Приложение завершено!');
            }
        }, 15000);
    });


    // --- Код для запуска фоновой музыки ---
    function startMusicOnFirstInteraction() {
        if (ambientMusic && ambientMusic.paused) {
            ambientMusic.play().catch(e => console.error("Autoplay failed:", e));
        }
        window.removeEventListener('click', startMusicOnFirstInteraction);
        window.removeEventListener('touchstart', startMusicOnFirstInteraction);
    }
    window.addEventListener('click', startMusicOnFirstInteraction);
    window.addEventListener('touchstart', startMusicOnFirstInteraction);
    
    // --- Основная инициализация ---
    resize();
    loadImages();
    generateBackgroundStars();
    canvas.addEventListener('click', handleClick);
    canvas.addEventListener('touchstart', handleTouch, { passive: false });
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    draw();

    // ===== ИЗМЕНЕННАЯ ФУНКЦИЯ ОБНОВЛЕНИЯ ДИАЛОГА =====
    function updateDialogueBubble() {
        if (currentDialogueIndex < dialogueLines.length) {
            const line = dialogueLines[currentDialogueIndex];
            if (line.speaker === 'alpha') {
                dialogueAlphaTextSpan.textContent = line.text;
                dialogueAlphaBubble.classList.remove('hidden');
            } else {
                dialogueBetaTextSpan.textContent = line.text;
                dialogueBetaBubble.classList.remove('hidden');
            }
        } else {
            // Диалог окончен, показываем кнопку "THE END"
            dialogueAlphaBubble.classList.add('hidden');
            dialogueBetaBubble.classList.add('hidden');
            theEndButton.classList.remove('hidden'); // <-- Показываем кнопку
        }
    }
}

function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    generateBackgroundStars();
}

function loadImages() {
    ['whaleBeta', 'whaleAlpha'].forEach(key => {
        const imageName = key.replace(/([A-Z])/g, '_$1').toLowerCase();
        const img = new Image();
        img.src = `images/${imageName}.png`;
        whaleImages[key] = { img: img, opacity: 0 };
    });
}

function generateBackgroundStars() {
    backgroundStars = [];
    for (let i = 0; i < 35; i++) {
        backgroundStars.push({ x: Math.random(), y: Math.random(), brightness: 0.3 + Math.random() * 0.7 });
    }
}

// --- ОБРАБОТКА ВВОДА ---
function handleClick(e) { handleInput(e.clientX, e.clientY); }
function handleTouch(e) {
    e.preventDefault();
    if (e.touches.length > 0) handleInput(e.touches[0].clientX, e.touches[0].clientY);
}

function handleInput(x, y) {
    if (gameState !== 'drawing') return;
    
    const currentStar = getStarPosition(gameData.whaleBetaCoords[currentStarIndex]);
    const distance = Math.sqrt((x - currentStar.x) ** 2 + (y - currentStar.y) ** 2);
    
    if (distance < 70) { 
        if (currentStarIndex > 0) {
            const prevStarData = gameData.whaleBetaCoords[currentStarIndex - 1];
            if (!prevStarData.jump) {
                const prevStarPos = getStarPosition(prevStarData);
                drawnLines.push({ from: prevStarPos, to: currentStar, opacity: 1, glow: 3 });
            }
        }
        
        const clickedStarData = gameData.whaleBetaCoords[currentStarIndex];
        
        if (clickedStarData.x === 0.390 && clickedStarData.y === 0.283) createShootingStar();
        if (clickedStarData.x === 0.633 && clickedStarData.y === 0.349) {
            document.getElementById('wishBubble').classList.remove('hidden');
            gameState = 'paused';
        }
        
        currentStarIndex++;
        
        if (currentStarIndex >= gameData.whaleBetaCoords.length) {
            if (ambientMusic) ambientMusic.pause();
            if (whaleSong) whaleSong.play();     
            gameState = 'whale1_appearing';
            createParticleBurst(gameData.whaleBetaCoords, '#4a9eff');
            drawnLines.forEach(l => l.glow = 5);
        }
    }
}

function handleMouseMove(e) { updateCursorTrail(e.clientX, e.clientY); }
function handleTouchMove(e) {
    e.preventDefault();
    if (e.touches.length > 0) updateCursorTrail(e.touches[0].clientX, e.touches[0].clientY);
}

function updateCursorTrail(x, y) {
    cursorTrail.unshift({x, y, life: 1});
    if (cursorTrail.length > 8) cursorTrail.pop();
}

function getStarPosition(coord) {
    const scale = height * 0.38;
    const rotation = Math.PI / 180 * -80;
    const centerX = width * 0.6;
    const centerY = height * 0.75;
    const localX = (coord.x - 0.5) * scale * 1.8;
    const localY = (coord.y - 0.5) * scale;
    const rotatedX = localX * Math.cos(rotation) - localY * Math.sin(rotation);
    const rotatedY = localX * Math.sin(rotation) + localY * Math.cos(rotation);
    return { x: rotatedX + centerX, y: rotatedY + centerY };
}

// --- ИГРОВОЙ ЦИКЛ И ЛОГИКА ---
function gameLoop() {
    animationTime += 0.016;
    nebulaOffset += 0.5;
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// ЗАМЕНИ ВСЮ СВОЮ ФУНКЦИЮ update НА ЭТУ ВЕРСИЮ:

// ЗАМЕНИ ВСЮ СВОЮ ФУНКЦИЮ update НА ЭТУ ВЕРСИЮ:

// ЗАМЕНИ ВСЮ СВОЮ ФУНКЦИЮ update НА ЭТУ ВЕРСИЮ:

// ЗАМЕНИ СВОЮ ФУНКЦИЮ update НА ЭТУ:

function update() {
    particles.forEach(p => { p.x += p.vx; p.y += p.vy; p.life -= 0.02; });
    particles = particles.filter(p => p.life > 0);
    cursorTrail.forEach(p => { p.life -= 0.05; });
    cursorTrail = cursorTrail.filter(p => p.life > 0);

    if (gameState === 'whale1_appearing') {
        whaleImages.whaleBeta.opacity = Math.min(1, whaleImages.whaleBeta.opacity + 0.02);
        if (whaleImages.whaleBeta.opacity >= 1) {
            drawnLines.forEach(l => l.opacity -= 0.03);
            if (drawnLines.every(l => l.opacity <= 0.01)) {
                gameState = 'waiting_for_alpha'; 
                setTimeout(() => {
                    gameState = 'whale2_appearing';
                    const alphaCenterX = width * 0.4;
                    const alphaCenterY = height * 0.25;
                    createPowerfulBurst(alphaCenterX, alphaCenterY, '#8a4aff');
                }, 2000); 
            }
        }
    }
    
    if (gameState === 'whale2_appearing') {
        whaleImages.whaleAlpha.opacity = Math.min(1, whaleImages.whaleAlpha.opacity + 0.02);
        
        if (whaleImages.whaleAlpha.opacity >= 1) {
            gameState = 'dialogue_start'; // Стейт для начала диалога
            
            const alphaBubble = document.getElementById('alphaBubble');
            const whaleCenterX = width * 0.4;
            const whaleCenterY = height * 0.25;
            const whaleHeight = height * 0.40;
            const rotation = Math.PI / 180 * -100;
            const noseOffsetY = -whaleHeight / 2;
            const rotatedNoseOffsetX = noseOffsetY * Math.sin(rotation);
            const rotatedNoseOffsetY = noseOffsetY * Math.cos(rotation);
            const noseX = whaleCenterX + rotatedNoseOffsetX;
            const noseY = whaleCenterY + rotatedNoseOffsetY;

            alphaBubble.style.left = noseX + 'px';
            alphaBubble.style.top = (noseY + 20) + 'px'; 
            
            alphaBubble.classList.remove('hidden');

            setTimeout(() => {
                alphaBubble.classList.add('hidden');
                document.getElementById('turnBubble').classList.remove('hidden');
                // ИЗМЕНЕНИЕ: Теперь ждем, пока пользователь перевернет экран и кликнет
                // gameState останется в 'dialogue_start' или перейдет в 'final' после клика по turnBubble
            }, 4000);
        }
    }
}

// --- ФУНКЦИИ ОТРИСОВКИ ---
function draw() {
    ctx.fillStyle = '#070B1A';
    ctx.fillRect(0, 0, width, height);
    drawNebula();
    drawBackgroundStars();
    
    if (gameState === 'drawing' || gameState === 'whale1_appearing' || gameState === 'paused') {
        drawInteractiveStars();
        drawLines();
    }
    
    if (whaleImages.whaleBeta.opacity > 0) drawWhale(whaleImages.whaleBeta, null, false);
    if (whaleImages.whaleAlpha.opacity > 0) drawWhale(whaleImages.whaleAlpha, null, true);
    
    drawParticles();
    drawShootingStars();
    drawCursorTrail();
}

function drawNebula() {
    const gradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, Math.max(width, height));
    gradient.addColorStop(0, 'rgba(42, 26, 74, 0.4)');
    gradient.addColorStop(1, 'rgba(7, 11, 26, 0.1)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
}

function createShootingStar() {
    const startX = width + 50, startY = -50;        
    const targetX = width * 0.15, targetY = height * 0.9; 
    const dx = targetX - startX, dy = targetY - startY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    shootingStars.push({
        x: startX, y: startY, len: 200 + Math.random() * 100,
        speed: 4 + Math.random() * 2, vx: dx / distance, vy: dy / distance, life: 1,
    });
}

function drawShootingStars() {
    shootingStars.forEach((star, index) => {
        star.x += star.vx * star.speed;
        star.y += star.vy * star.speed;
        star.life -= 0.004;
        if (star.life <= 0 || star.x < -star.len) {
            shootingStars.splice(index, 1);
            return;
        }
        ctx.save();
        ctx.globalAlpha = star.life;
        ctx.shadowBlur = 20;
        ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
        const tailX = star.x - star.vx * star.len;
        const tailY = star.y - star.vy * star.len;
        const gradient = ctx.createLinearGradient(star.x, star.y, tailX, tailY);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(star.x, star.y);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(star.x, star.y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    });
}

function drawBackgroundStars() {
    backgroundStars.forEach(star => {
        ctx.save();
        ctx.globalAlpha = star.brightness * (0.6 + Math.sin(animationTime * 2 + star.x) * 0.4);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(star.x * width, star.y * height, 2, 2);
        ctx.restore();
    });
}

function drawInteractiveStars() {
    gameData.whaleBetaCoords.forEach((coord, index) => {
        const pos = getStarPosition(coord);
        const isActive = index === currentStarIndex;
        ctx.save();
        ctx.translate(pos.x, pos.y);
        if (isActive) {
            ctx.scale(1.3 + Math.sin(animationTime * 8) * 0.5, 1.3 + Math.sin(animationTime * 8) * 0.5);
            ctx.shadowBlur = 30;
            ctx.shadowColor = '#4a9eff';
        }
        ctx.fillStyle = index < currentStarIndex ? '#4a9eff' : '#ffffff';
        ctx.strokeStyle = isActive ? '#4a9eff' : '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = 0; i < 8; i++) {
            const r = (i % 2 === 0) ? (isActive ? 8 : 6) : (isActive ? 4 : 3);
            ctx.lineTo(Math.cos(i * Math.PI / 4) * r, Math.sin(i * Math.PI / 4) * r);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
    });
}

function drawLines() {
    drawnLines.forEach(line => {
        if (line.opacity <= 0) return;
        ctx.save();
        ctx.globalAlpha = line.opacity;
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        const gradient = ctx.createLinearGradient(line.from.x, line.from.y, line.to.x, line.to.y);
        gradient.addColorStop(0, '#4a9eff');
        gradient.addColorStop(1, '#8a4aff');
        ctx.strokeStyle = gradient;
        ctx.shadowBlur = Math.max(5, 20 * line.glow);
        ctx.shadowColor = '#4a9eff';
        ctx.beginPath();
        ctx.moveTo(line.from.x, line.from.y);
        ctx.lineTo(line.to.x, line.to.y);
        ctx.stroke();
        ctx.restore();
    });
}

function drawWhale(whale, coords, isSecondWhale = false) {
    if (!whale.img || whale.opacity <= 0 || !whale.img.complete || whale.img.naturalWidth === 0) return;
    const whaleScale = 1 + Math.sin(animationTime * 2) * 0.02;
    ctx.save();
    ctx.globalAlpha = whale.opacity;
    let centerX, centerY, imgWidth, imgHeight, rotation;
    if (isSecondWhale) {
        imgHeight = height * 0.40;
        imgWidth = (whale.img.width / whale.img.height) * imgHeight;
        centerX = width * 0.4;    
        centerY = height * 0.25;  
        rotation = Math.PI / 180 * -100; 
    } else {
        imgHeight = height * 0.38;
        imgWidth = (whale.img.width / whale.img.height) * imgHeight;
        centerX = width * 0.6;    
        centerY = height * 0.75;  
        rotation = Math.PI / 180 * -80; 
    }
    ctx.translate(centerX, centerY);
    ctx.rotate(rotation);
    ctx.scale(whaleScale, whaleScale);
    ctx.drawImage(whale.img, -imgWidth / 2, -imgHeight / 2, imgWidth, imgHeight);
    ctx.restore();
}

function drawParticles() {
    particles.forEach(p => {
        if (p.life <= 0) return;
        ctx.save();
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    });
}

function drawCursorTrail() {
    cursorTrail.forEach(p => {
        if (p.life <= 0) return;
        ctx.save();
        ctx.globalAlpha = p.life * 0.8; 
        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#4a9eff';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.life * 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    });
}