const gameBoard = document.querySelector('.game-board');
const movesDisplay = document.getElementById('moves');
const scoreDisplay = document.getElementById('score');
const timerDisplay = document.getElementById('timer');
const restartButton = document.getElementById('restart');
const toggleSoundButton = document.getElementById('toggleSound');

// Sound elements
const flipSound = document.getElementById('flipSound');
const matchSound = document.getElementById('matchSound');
const noMatchSound = document.getElementById('noMatchSound');
const gameOverSound = document.getElementById('gameOverSound');

let isSoundEnabled = true;
const emojis = ['🎮', '🎲', '🎯', '🎪', '🎨', '🎭', '🎪', '🎯', '🎲', '🎮', '🎨', '🎭'];
let cards = [];
let flippedCards = [];
let matchedPairs = 0;
let moves = 0;
let score = 0;
let timer = 0;
let gameInterval;
let isPlaying = false;

// Sound functions
function playSound(sound) {
    if (isSoundEnabled && sound) {
        sound.currentTime = 0;
        sound.play().catch(err => console.log('Sound play failed:', err));
    }
}

function toggleSound() {
    isSoundEnabled = !isSoundEnabled;
    toggleSoundButton.innerHTML = isSoundEnabled ? '<i class="fas fa-volume-up"></i>' : '<i class="fas fa-volume-mute"></i>';
    toggleSoundButton.classList.toggle('muted', !isSoundEnabled);
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function createCard(emoji) {
    const card = document.createElement('div');
    card.classList.add('card');
    card.innerHTML = `
        <div class="card-front">
            <i class="fas fa-question"></i>
        </div>
        <div class="card-back">${emoji}</div>
    `;
    return card;
}

function flipCard(card) {
    if (!isPlaying) startGame();
    if (flippedCards.length === 2 || card.classList.contains('flipped') || card.classList.contains('matched')) return;

    playSound(flipSound);
    card.classList.add('flipped');
    flippedCards.push(card);

    if (flippedCards.length === 2) {
        moves++;
        movesDisplay.textContent = moves;
        checkMatch();
    }
}

function checkMatch() {
    const [card1, card2] = flippedCards;
    const emoji1 = card1.querySelector('.card-back').textContent;
    const emoji2 = card2.querySelector('.card-back').textContent;

    if (emoji1 === emoji2) {
        playSound(matchSound);
        card1.classList.add('matched');
        card2.classList.add('matched');
        matchedPairs++;
        score += 10;
        scoreDisplay.textContent = score;
        
        if (matchedPairs === emojis.length / 2) {
            endGame();
        }
    } else {
        playSound(noMatchSound);
        setTimeout(() => {
            card1.classList.remove('flipped');
            card2.classList.remove('flipped');
            score = Math.max(0, score - 2);
            scoreDisplay.textContent = score;
        }, 1000);
    }

    flippedCards = [];
}

function startGame() {
    isPlaying = true;
    gameInterval = setInterval(() => {
        timer++;
        timerDisplay.textContent = `${timer}s`;
    }, 1000);
}

function endGame() {
    isPlaying = false;
    clearInterval(gameInterval);
    const timeBonus = Math.max(0, 100 - timer);
    const moveBonus = Math.max(0, 50 - moves * 2);
    const finalScore = score + timeBonus + moveBonus;
    scoreDisplay.textContent = finalScore;
    
    playSound(gameOverSound);
    
    // Redirect to results page with all scores
    const params = new URLSearchParams({
        baseScore: score,
        timeBonus: timeBonus,
        moveBonus: moveBonus,
        finalScore: finalScore,
        moves: moves,
        time: timer
    });
    
    setTimeout(() => {
        window.location.href = `results.html?${params.toString()}`;
    }, 1000);
}

function initializeGame() {
    gameBoard.innerHTML = '';
    cards = [];
    flippedCards = [];
    matchedPairs = 0;
    moves = 0;
    score = 0;
    timer = 0;
    isPlaying = false;
    clearInterval(gameInterval);
    
    movesDisplay.textContent = moves;
    scoreDisplay.textContent = score;
    timerDisplay.textContent = '0s';

    const shuffledEmojis = shuffle([...emojis]);
    shuffledEmojis.forEach(emoji => {
        const card = createCard(emoji);
        card.addEventListener('click', () => flipCard(card));
        gameBoard.appendChild(card);
        cards.push(card);
    });
}

// Initialize event listeners
toggleSoundButton.addEventListener('click', toggleSound);
restartButton.addEventListener('click', initializeGame);
initializeGame();
