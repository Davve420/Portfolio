const WORDS = [
    'javascript',
    'portfolio',
    'developer',
    'browser',
    'function',
    'frontend',
    'hangman',
    'netlify',
    'creative',
    'minimal',
    'keyboard',
    'project',
];

const STAGES = [
` +---+
 |   |
     |
     |
     |
     |
=========`,
` +---+
 |   |
 O   |
     |
     |
     |
=========`,
` +---+
 |   |
 O   |
 |   |
     |
     |
=========`,
` +---+
 |   |
 O   |
/|   |
     |
     |
=========`,
` +---+
 |   |
 O   |
/|\\  |
     |
     |
=========`,
` +---+
 |   |
 O   |
/|\\  |
/    |
     |
=========`,
` +---+
 |   |
 O   |
/|\\  |
/ \\  |
     |
=========`,
` +---+
 |   |
[O   |
/|\\  |
/ \\  |
     |
=========`,
` +---+
 |   |
[O]  |
/|\\  |
/ \\  |
     |
=========`
];

const MAX_WRONG = 8;

let selectedWord = '';
let guessedLetters = new Set();
let wrongLetters = [];
let wrongCount = 0;
let gameOver = false;

const wordProgressEl = document.getElementById('wordProgress');
const wrongCountEl = document.getElementById('wrongCount');
const usedLettersEl = document.getElementById('usedLetters');
const wrongLettersEl = document.getElementById('wrongLetters');
const messageEl = document.getElementById('message');
const guessInputEl = document.getElementById('guessInput');
const guessBtnEl = document.getElementById('guessBtn');
const newGameBtnEl = document.getElementById('newGameBtn');
const drawingEl = document.getElementById('hangmanDrawing');

function pickWord() {
    const index = Math.floor(Math.random() * WORDS.length);
    return WORDS[index];
}

function getWordProgress() {
    return selectedWord
        .split('')
        .map((char) => (guessedLetters.has(char) ? char : '_'))
        .join(' ');
}

function isWon() {
    return selectedWord.split('').every((char) => guessedLetters.has(char));
}

function setMessage(text, color = '#1a120c') {
    messageEl.textContent = text;
    messageEl.style.color = color;
}

function render() {
    wordProgressEl.textContent = getWordProgress();
    wrongCountEl.textContent = String(wrongCount);
    usedLettersEl.textContent = guessedLetters.size ? [...guessedLetters].sort().join(', ') : '-';
    wrongLettersEl.textContent = `Wrong letters: ${wrongLetters.length ? wrongLetters.join(', ') : '-'}`;
    drawingEl.textContent = STAGES[wrongCount];
}

function finishGame(win) {
    gameOver = true;
    guessInputEl.disabled = true;
    guessBtnEl.disabled = true;
    if (win) {
        setMessage('You won! Nice guesses.', '#14532d');
    } else {
        setMessage(`Game over. The word was "${selectedWord}".`, '#7b1208');
    }
}

function handleGuess() {
    if (gameOver) return;

    const letter = guessInputEl.value.trim().toLowerCase();
    guessInputEl.value = '';
    guessInputEl.focus();

    if (!/^[a-z]$/.test(letter)) {
        setMessage('Type one letter (a-z).', '#7b1208');
        return;
    }

    if (guessedLetters.has(letter)) {
        setMessage(`You already guessed "${letter}".`, '#7b1208');
        return;
    }

    guessedLetters.add(letter);

    if (selectedWord.includes(letter)) {
        setMessage(`Good guess: "${letter}" is in the word.`, '#14532d');
        render();
        if (isWon()) {
            finishGame(true);
        }
        return;
    }

    wrongLetters.push(letter);
    wrongCount += 1;
    setMessage(`Nope: "${letter}" is not in the word.`, '#7b1208');
    render();

    if (wrongCount >= MAX_WRONG) {
        finishGame(false);
    }
}

function startNewGame() {
    selectedWord = pickWord();
    guessedLetters = new Set();
    wrongLetters = [];
    wrongCount = 0;
    gameOver = false;

    guessInputEl.disabled = false;
    guessBtnEl.disabled = false;
    guessInputEl.value = '';
    setMessage('New game started. Good luck!');
    render();
    guessInputEl.focus();
}

guessBtnEl.addEventListener('click', handleGuess);
newGameBtnEl.addEventListener('click', startNewGame);
guessInputEl.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        handleGuess();
    }
});

document.addEventListener('keydown', (event) => {
    if (document.activeElement === guessInputEl) return;
    if (event.key.length === 1 && /[a-zA-Z]/.test(event.key)) {
        guessInputEl.focus();
        guessInputEl.value = event.key.toLowerCase();
    }
});

startNewGame();
