const WORDS = [
  "I",
  "You",
  "Me",
  "We",
  "It",
  "Was",
  "Is",
  "Her",
  "Him",
  "Went",
  "Go",
  "See",
  "Hear",
  "Be",
  "Are",
  "Were",
  "And",
  "As",
];

const BALLOON_COLORS = [
  "#f45b69",
  "#ff9f1c",
  "#5bc0eb",
  "#7b61ff",
  "#3ac569",
  "#ff6fb1",
  "#00a6a6",
  "#ef476f",
  "#f4a261",
];

const startScreen = document.querySelector("#start-screen");
const playScreen = document.querySelector("#play-screen");
const finishScreen = document.querySelector("#finish-screen");
const startButton = document.querySelector("#start-button");
const playAgainButton = document.querySelector("#play-again-button");
const repeatButton = document.querySelector("#repeat-button");
const balloonField = document.querySelector("#balloon-field");
const currentWord = document.querySelector("#current-word");

let audioContext;
let remainingWords = [];
let targetWord = "";

startButton.addEventListener("click", startGame);
playAgainButton.addEventListener("click", startGame);
repeatButton.addEventListener("click", () => speakWord(targetWord));

function startGame() {
  remainingWords = shuffle([...WORDS]);
  targetWord = "";
  setupAudio();
  renderBalloons();
  showScreen(playScreen);
  chooseNextWord();
}

function renderBalloons() {
  balloonField.innerHTML = "";

  WORDS.forEach((word, index) => {
    const balloon = document.createElement("button");
    balloon.type = "button";
    balloon.className = "balloon";
    balloon.textContent = word;
    balloon.dataset.word = word;
    balloon.setAttribute("aria-label", `${word} balloon`);
    balloon.style.setProperty("--balloon-color", BALLOON_COLORS[index % BALLOON_COLORS.length]);

    const position = getBalloonPosition(index);
    balloon.style.setProperty("--balloon-x", `${position.x}%`);
    balloon.style.setProperty("--balloon-y", `${position.y}%`);
    balloon.style.setProperty("--drift-x", `${position.driftX}vw`);
    balloon.style.setProperty("--drift-y", `${position.driftY}vh`);
    balloon.style.setProperty("--float-duration", `${position.duration}s`);
    balloon.style.animationDelay = `${position.delay}s`;

    balloon.addEventListener("click", () => handleBalloonTap(balloon));
    balloonField.append(balloon);
  });
}

function getBalloonPosition(index) {
  const column = index % 6;
  const row = Math.floor(index / 6);
  const x = 10 + column * 16 + (row % 2) * 6;
  const y = 23 + row * 19 + ((index * 7) % 11);

  return {
    x: Math.min(x, 91),
    y: Math.min(y, 82),
    driftX: 1.6 + (index % 4) * 0.55,
    driftY: 1.4 + (index % 3) * 0.65,
    duration: 5.6 + (index % 5) * 0.7,
    delay: -1 * ((index % 7) * 0.45),
  };
}

function handleBalloonTap(balloon) {
  const selectedWord = balloon.dataset.word;

  if (selectedWord !== targetWord) {
    playBuzz();
    showWrongChoice(balloon);
    return;
  }

  balloon.classList.add("is-popping");
  balloon.setAttribute("aria-hidden", "true");
  balloon.disabled = true;
  remainingWords = remainingWords.filter((word) => word !== selectedWord);

  window.setTimeout(() => {
    balloon.remove();

    if (remainingWords.length === 0) {
      finishGame();
      return;
    }

    chooseNextWord();
  }, 280);
}

function showWrongChoice(balloon) {
  balloon.classList.remove("is-wrong");
  void balloon.offsetWidth;
  balloon.classList.add("is-wrong");
  window.setTimeout(() => balloon.classList.remove("is-wrong"), 260);
}

function chooseNextWord() {
  targetWord = remainingWords[Math.floor(Math.random() * remainingWords.length)];
  currentWord.textContent = "Listen...";
  window.setTimeout(() => {
    currentWord.textContent = "Tap the word you hear!";
    speakWord(targetWord);
  }, 300);
}

function finishGame() {
  currentWord.textContent = "All done!";
  speakWord("Congratulations");
  window.setTimeout(() => showScreen(finishScreen), 500);
}

function showScreen(activeScreen) {
  [startScreen, playScreen, finishScreen].forEach((screen) => {
    screen.classList.toggle("is-hidden", screen !== activeScreen);
  });
}

function setupAudio() {
  const AudioContext = window.AudioContext || window.webkitAudioContext;

  if (!AudioContext) {
    return;
  }

  audioContext ??= new AudioContext();

  if (audioContext.state === "suspended") {
    audioContext.resume();
  }
}

function playBuzz() {
  if (!audioContext) {
    return;
  }

  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  const startTime = audioContext.currentTime;

  oscillator.type = "sawtooth";
  oscillator.frequency.setValueAtTime(130, startTime);
  oscillator.frequency.linearRampToValueAtTime(80, startTime + 0.22);
  gain.gain.setValueAtTime(0.0001, startTime);
  gain.gain.exponentialRampToValueAtTime(0.28, startTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.24);

  oscillator.connect(gain);
  gain.connect(audioContext.destination);
  oscillator.start(startTime);
  oscillator.stop(startTime + 0.25);
}

function speakWord(word) {
  if (!word || !("speechSynthesis" in window)) {
    return;
  }

  const utterance = new SpeechSynthesisUtterance(word);
  utterance.lang = "en-US";
  utterance.rate = 0.78;
  utterance.pitch = 1.08;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

function shuffle(words) {
  for (let index = words.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [words[index], words[swapIndex]] = [words[swapIndex], words[index]];
  }

  return words;
}
