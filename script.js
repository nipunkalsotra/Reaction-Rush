/* ==================== GAME STATE MANAGEMENT ==================== */
const GameState = {
    status: 'idle', // 'idle', 'playing', 'paused', 'gameOver'
    score: 0,
    timeLeft: 60,
    level: 'easy',
    combo: 0,
    maxCombo: 0,
    targetsHit: 0,
    targetsMissed: 0,
    soundEnabled: true,
    
    // Difficulty settings
    difficulties: {
        easy: { targetDuration: 2500, spawnInterval: 1500, scorePerHit: 10 },
        medium: { targetDuration: 1500, spawnInterval: 1000, scorePerHit: 20 },
        hard: { targetDuration: 1000, spawnInterval: 700, scorePerHit: 30 }
    }
};

/* ==================== DOM ELEMENTS ==================== */
const elements = {
    // Screens
    startScreen: document.getElementById('startScreen'),
    gameScreen: document.getElementById('gameScreen'),
    pauseScreen: document.getElementById('pauseScreen'),
    gameOverScreen: document.getElementById('gameOverScreen'),
    leaderboardScreen: document.getElementById('leaderboardScreen'),
    
    // Stats
    scoreDisplay: document.getElementById('score'),
    timerDisplay: document.getElementById('timer'),
    comboDisplay: document.getElementById('combo'),
    levelDisplay: document.getElementById('level'),
    
    // Game
    gameBoard: document.getElementById('gameBoard'),
    
    // Buttons
    startBtn: document.getElementById('startBtn'),
    pauseBtn: document.getElementById('pauseBtn'),
    resumeBtn: document.getElementById('resumeBtn'),
    quitBtn: document.getElementById('quitBtn'),
    quitFromPauseBtn: document.getElementById('quitFromPauseBtn'),
    playAgainBtn: document.getElementById('playAgainBtn'),
    menuBtn: document.getElementById('menuBtn'),
    viewLeaderboardBtn: document.getElementById('viewLeaderboardBtn'),
    backToMenuBtn: document.getElementById('backToMenuBtn'),
    soundToggle: document.getElementById('soundToggle'),
    
    // Final stats
    finalScore: document.getElementById('finalScore'),
    maxCombo: document.getElementById('maxCombo'),
    targetsHit: document.getElementById('targetsHit'),
    newHighScore: document.getElementById('newHighScore'),
    
    // Leaderboard
    leaderboardContent: document.getElementById('leaderboardContent'),
    
    // Difficulty
    difficultyBtns: document.querySelectorAll('.difficulty-btn')
};

/* ==================== GAME TIMERS & INTERVALS ==================== */
let gameTimer = null;
let targetSpawner = null;
let activeTargets = [];

/* ==================== SOUND SYSTEM ==================== */
const SoundSystem = {
    play(type) {
        if (!GameState.soundEnabled) return;
        
        // Using Web Audio API for simple beeps
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        switch(type) {
            case 'hit':
                oscillator.frequency.value = 800;
                gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.1);
                break;
            case 'miss':
                oscillator.frequency.value = 200;
                gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.2);
                break;
            case 'combo':
                oscillator.frequency.value = 1200;
                gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.3);
                break;
            case 'gameOver':
                oscillator.frequency.value = 300;
                gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.5);
                break;
        }
    }
};

/* ==================== SCREEN MANAGEMENT ==================== */
function switchScreen(screenToShow) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    screenToShow.classList.add('active');
}

/* ==================== DIFFICULTY SELECTION ==================== */
elements.difficultyBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        elements.difficultyBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        GameState.level = btn.dataset.level;
        updateDisplay();
    });
});

/* ==================== GAME INITIALIZATION ==================== */
function initGame() {
    GameState.status = 'playing';
    GameState.score = 0;
    GameState.timeLeft = 60;
    GameState.combo = 0;
    GameState.maxCombo = 0;
    GameState.targetsHit = 0;
    GameState.targetsMissed = 0;
    
    updateDisplay();
    switchScreen(elements.gameScreen);
    
    startGameTimer();
    startTargetSpawner();
}

/* ==================== TIMER SYSTEM ==================== */
function startGameTimer() {
    gameTimer = setInterval(() => {
        if (GameState.status !== 'playing') return;
        
        GameState.timeLeft--;
        updateDisplay();
        
        // Visual warning when time is running out
        if (GameState.timeLeft <= 10) {
            elements.timerDisplay.style.color = '#ff4444';
            elements.timerDisplay.style.animation = 'pulse 0.5s ease-in-out';
        }
        
        if (GameState.timeLeft <= 0) {
            endGame();
        }
    }, 1000);
}

function stopGameTimer() {
    if (gameTimer) {
        clearInterval(gameTimer);
        gameTimer = null;
    }
}

/* ==================== TARGET SPAWNING SYSTEM ==================== */
function startTargetSpawner() {
    const config = GameState.difficulties[GameState.level];
    
    targetSpawner = setInterval(() => {
        if (GameState.status !== 'playing') return;
        spawnTarget();
    }, config.spawnInterval);
}

function stopTargetSpawner() {
    if (targetSpawner) {
        clearInterval(targetSpawner);
        targetSpawner = null;
    }
}

function spawnTarget() {
    const config = GameState.difficulties[GameState.level];
    const target = document.createElement('div');
    target.className = 'target';
    target.innerHTML = '🎯';
    
    // Random position within game board
    const maxX = elements.gameBoard.clientWidth - 60;
    const maxY = elements.gameBoard.clientHeight - 60;
    const x = Math.random() * maxX;
    const y = Math.random() * maxY;
    
    target.style.left = x + 'px';
    target.style.top = y + 'px';
    
    // Add click event
    target.addEventListener('click', (e) => {
        e.stopPropagation();
        hitTarget(target);
    });
    
    elements.gameBoard.appendChild(target);
    activeTargets.push(target);
    
    // Auto-remove after duration
    setTimeout(() => {
        if (target.parentElement) {
            missTarget(target);
        }
    }, config.targetDuration);
}

/* ==================== TARGET HIT/MISS LOGIC ==================== */
function hitTarget(target) {
    if (!target.parentElement) return; // Already removed
    
    const config = GameState.difficulties[GameState.level];
    
    // Add hit animation
    target.classList.add('hit');
    
    // Update stats
    GameState.targetsHit++;
    GameState.combo++;
    
    if (GameState.combo > GameState.maxCombo) {
        GameState.maxCombo = GameState.combo;
    }
    
    // Calculate score with combo bonus
    let points = config.scorePerHit;
    if (GameState.combo >= 3) {
        points *= Math.floor(GameState.combo / 3) + 1;
        showComboPopup(GameState.combo);
        SoundSystem.play('combo');
    } else {
        SoundSystem.play('hit');
    }
    
    GameState.score += points;
    updateDisplay();
    
    // Remove target
    setTimeout(() => {
        if (target.parentElement) {
            target.remove();
        }
        activeTargets = activeTargets.filter(t => t !== target);
    }, 300);
}

function missTarget(target) {
    if (!target.parentElement) return;
    
    GameState.targetsMissed++;
    GameState.combo = 0; // Reset combo
    GameState.score = Math.max(0, GameState.score - 5); // Penalty
    
    SoundSystem.play('miss');
    updateDisplay();
    
    target.remove();
    activeTargets = activeTargets.filter(t => t !== target);
}

/* ==================== COMBO POPUP ==================== */
function showComboPopup(combo) {
    const popup = document.createElement('div');
    popup.className = 'combo-popup';
    popup.textContent = `${combo}x COMBO!`;
    document.body.appendChild(popup);
    
    setTimeout(() => popup.remove(), 1000);
}

/* ==================== WRONG CLICK PENALTY ==================== */
elements.gameBoard.addEventListener('click', (e) => {
    if (e.target === elements.gameBoard && GameState.status === 'playing') {
        GameState.combo = 0;
        GameState.score = Math.max(0, GameState.score - 3);
        SoundSystem.play('miss');
        updateDisplay();
    }
});

/* ==================== UI UPDATE ==================== */
function updateDisplay() {
    elements.scoreDisplay.textContent = GameState.score;
    elements.timerDisplay.textContent = GameState.timeLeft;
    elements.comboDisplay.textContent = `x${GameState.combo}`;
    elements.levelDisplay.textContent = GameState.level.charAt(0).toUpperCase() + GameState.level.slice(1);
    
    // Combo visual feedback
    if (GameState.combo >= 3) {
        elements.comboDisplay.style.color = '#ffd700';
        elements.comboDisplay.style.transform = 'scale(1.2)';
    } else {
        elements.comboDisplay.style.color = '#333';
        elements.comboDisplay.style.transform = 'scale(1)';
    }
}

/* ==================== GAME PAUSE/RESUME ==================== */
function pauseGame() {
    GameState.status = 'paused';
    switchScreen(elements.pauseScreen);
}

function resumeGame() {
    GameState.status = 'playing';
    switchScreen(elements.gameScreen);
}

/* ==================== GAME END ==================== */
function endGame() {
    GameState.status = 'gameOver';
    stopGameTimer();
    stopTargetSpawner();
    
    // Clear active targets
    activeTargets.forEach(target => target.remove());
    activeTargets = [];
    
    // Display final stats
    elements.finalScore.textContent = GameState.score;
    elements.maxCombo.textContent = `x${GameState.maxCombo}`;
    elements.targetsHit.textContent = GameState.targetsHit;
    
    // Check for high score
    const isNewHighScore = saveScore();
    if (isNewHighScore) {
        elements.newHighScore.classList.remove('hidden');
    } else {
        elements.newHighScore.classList.add('hidden');
    }
    
    SoundSystem.play('gameOver');
    switchScreen(elements.gameOverScreen);
}

/* ==================== QUIT GAME ==================== */
function quitGame() {
    GameState.status = 'idle';
    stopGameTimer();
    stopTargetSpawner();
    
    // Clear active targets
    activeTargets.forEach(target => target.remove());
    activeTargets = [];
    
    // Reset timer display
    elements.timerDisplay.style.color = '#333';
    elements.timerDisplay.style.animation = 'none';
    
    switchScreen(elements.startScreen);
}

/* ==================== LEADERBOARD SYSTEM ==================== */
function saveScore() {
    const scores = getLeaderboard();
    
    const newScore = {
        score: GameState.score,
        level: GameState.level,
        combo: GameState.maxCombo,
        hits: GameState.targetsHit,
        date: new Date().toLocaleDateString()
    };
    
    scores.push(newScore);
    scores.sort((a, b) => b.score - a.score);
    
    // Keep top 10
    const topScores = scores.slice(0, 10);
    localStorage.setItem('reactionRushScores', JSON.stringify(topScores));
    
    // Check if new high score
    return topScores[0].score === GameState.score;
}

function getLeaderboard() {
    const stored = localStorage.getItem('reactionRushScores');
    return stored ? JSON.parse(stored) : [];
}

function displayLeaderboard() {
    const scores = getLeaderboard();
    
    if (scores.length === 0) {
        elements.leaderboardContent.innerHTML = '<div class="leaderboard-empty">No scores yet. Be the first to play!</div>';
        return;
    }
    
    let html = '';
    scores.forEach((score, index) => {
        const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '';
        html += `
            <div class="leaderboard-item">
                <div class="leaderboard-rank">${medal || (index + 1)}</div>
                <div class="leaderboard-details">
                    <div class="leaderboard-level">${score.level.toUpperCase()} • ${score.date}</div>
                    <div>Combo: x${score.combo} • Hits: ${score.hits}</div>
                </div>
                <div class="leaderboard-score">${score.score}</div>
            </div>
        `;
    });
    
    elements.leaderboardContent.innerHTML = html;
}

/* ==================== SOUND TOGGLE ==================== */
elements.soundToggle.addEventListener('click', () => {
    GameState.soundEnabled = !GameState.soundEnabled;
    elements.soundToggle.textContent = GameState.soundEnabled ? '🔊' : '🔇';
    elements.soundToggle.classList.toggle('muted');
});

/* ==================== EVENT LISTENERS ==================== */
elements.startBtn.addEventListener('click', initGame);
elements.pauseBtn.addEventListener('click', pauseGame);
elements.resumeBtn.addEventListener('click', resumeGame);
elements.quitBtn.addEventListener('click', quitGame);
elements.quitFromPauseBtn.addEventListener('click', quitGame);
elements.playAgainBtn.addEventListener('click', initGame);
elements.menuBtn.addEventListener('click', quitGame);

elements.viewLeaderboardBtn.addEventListener('click', () => {
    displayLeaderboard();
    switchScreen(elements.leaderboardScreen);
});

elements.backToMenuBtn.addEventListener('click', () => {
    switchScreen(elements.startScreen);
});

// Keyboard controls
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && GameState.status === 'playing') {
        pauseGame();
    } else if (e.key === 'Escape' && GameState.status === 'paused') {
        resumeGame();
    }
});

/* ==================== INITIALIZE ==================== */
updateDisplay();