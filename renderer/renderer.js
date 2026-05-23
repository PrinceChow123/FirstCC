// --- State ---
let state = {
  settings: {
    focusDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    longBreakInterval: 4,
  },
  timerState: {
    mode: 'focus',
    remainingSeconds: 25 * 60,
    isRunning: false,
    endTime: null,
    completedFocusSessions: 0,
  },
  tasks: [],
  currentTaskId: null,
  sessionHistory: {},
};

let tickInterval = null;
let audioCtx = null;

// --- Helpers ---
function modeDuration(mode) {
  const s = state.settings;
  if (mode === 'focus') return s.focusDuration * 60;
  if (mode === 'shortBreak') return s.shortBreakDuration * 60;
  return s.longBreakDuration * 60;
}

function modeLabel(mode) {
  if (mode === 'focus') return 'Focus';
  if (mode === 'shortBreak') return 'Short Break';
  return 'Long Break';
}

function formatTime(s) {
  const m = String(Math.floor(s / 60)).padStart(2, '0');
  const sec = String(s % 60).padStart(2, '0');
  return `${m}:${sec}`;
}

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// --- Persistence ---
async function loadState() {
  const data = await window.electronAPI.getData();
  state = { ...state, ...data };

  // Handle relaunch mid-session
  if (state.timerState.isRunning && state.timerState.endTime) {
    const elapsed = Math.round((Date.now() - state.timerState.endTime) / 1000) + modeDuration(state.timerState.mode);
    state.timerState.remainingSeconds = Math.max(0, modeDuration(state.timerState.mode) - elapsed);
    if (state.timerState.remainingSeconds <= 0) {
      state.timerState.remainingSeconds = modeDuration(state.timerState.mode);
      state.timerState.isRunning = false;
      state.timerState.endTime = null;
    } else {
      state.timerState.endTime = Date.now() + state.timerState.remainingSeconds * 1000;
    }
  } else {
    state.timerState.isRunning = false;
    state.timerState.endTime = null;
    state.timerState.remainingSeconds = modeDuration(state.timerState.mode);
  }
}

async function persistState() {
  await window.electronAPI.saveData(state);
}

async function updateTray(text) {
  await window.electronAPI.updateTray(text);
}

// --- Audio ---
function ensureAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

function playChime() {
  ensureAudio();
  const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
  const now = audioCtx.currentTime;

  notes.forEach((freq, i) => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.3, now + i * 0.2);
    gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.2 + 0.4);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now + i * 0.2);
    osc.stop(now + i * 0.2 + 0.4);
  });
}

// --- DOM Elements ---
const $time = document.getElementById('timer-time');
const $label = document.getElementById('timer-label');
const $btnStart = document.getElementById('btn-start');
const $btnPause = document.getElementById('btn-pause');
const $btnReset = document.getElementById('btn-reset');
const $ring = document.querySelector('.ring-progress');
const $container = document.querySelector('.app-container');
const $dots = document.querySelectorAll('.dot');
const $modeBtns = document.querySelectorAll('.mode-btn');
const $currentTaskName = document.getElementById('current-task-name');
const $taskInput = document.getElementById('task-input');
const $taskList = document.getElementById('task-list');
const $sessionStats = document.getElementById('session-stats');

const RING_LENGTH = 2 * Math.PI * 90; // ~565.48

// --- Render ---
function renderTimer() {
  const { mode, remainingSeconds, isRunning } = state.timerState;
  const duration = modeDuration(mode);

  $time.textContent = formatTime(remainingSeconds);
  $label.textContent = modeLabel(mode);

  // Ring progress
  const fraction = remainingSeconds / duration;
  $ring.style.strokeDashoffset = RING_LENGTH * (1 - fraction);

  // Container mode
  $container.dataset.mode = mode;

  // Buttons
  $btnStart.disabled = isRunning;
  $btnPause.disabled = !isRunning;

  // Tray
  if (isRunning) {
    updateTray(formatTime(remainingSeconds));
  }
}

function renderDots() {
  const completed = state.timerState.completedFocusSessions % state.settings.longBreakInterval;
  $dots.forEach((dot, i) => {
    dot.classList.toggle('filled', i < completed);
  });
}

function renderModeButtons() {
  $modeBtns.forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.mode === state.timerState.mode);
  });
}

function renderCurrentTask() {
  const task = state.tasks.find((t) => t.id === state.currentTaskId);
  $currentTaskName.textContent = task ? task.text : '---';
}

function renderTasks() {
  $taskList.innerHTML = '';
  state.tasks.forEach((task) => {
    const li = document.createElement('li');
    li.className = `task-item${task.completed ? ' completed' : ''}`;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'task-checkbox';
    checkbox.checked = task.completed;
    checkbox.addEventListener('change', () => toggleTask(task.id));

    const text = document.createElement('span');
    text.className = 'task-text';
    text.textContent = task.text;

    const selectBtn = document.createElement('button');
    selectBtn.className = `task-select${task.id === state.currentTaskId ? ' selected' : ''}`;
    selectBtn.title = 'Select as current task';
    selectBtn.addEventListener('click', () => selectTask(task.id));

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'task-delete';
    deleteBtn.textContent = '×';
    deleteBtn.title = 'Delete task';
    deleteBtn.addEventListener('click', () => deleteTask(task.id));

    li.appendChild(checkbox);
    li.appendChild(text);
    li.appendChild(selectBtn);
    li.appendChild(deleteBtn);
    $taskList.appendChild(li);
  });
}

function renderStats() {
  const key = todayKey();
  const count = state.sessionHistory[key]?.focusSessionsCompleted || 0;
  $sessionStats.textContent = `Today: ${count} session${count !== 1 ? 's' : ''} completed`;
}

function renderAll() {
  renderTimer();
  renderDots();
  renderModeButtons();
  renderCurrentTask();
  renderTasks();
  renderStats();
}

// --- Timer Logic ---
function startTimer() {
  ensureAudio();
  state.timerState.isRunning = true;
  state.timerState.endTime = Date.now() + state.timerState.remainingSeconds * 1000;
  persistState();
  renderTimer();

  tickInterval = setInterval(tick, 250);
}

function tick() {
  const { endTime, mode } = state.timerState;
  const remaining = Math.max(0, Math.round((endTime - Date.now()) / 1000));
  state.timerState.remainingSeconds = remaining;

  renderTimer();

  if (remaining <= 0) {
    completeSession();
  }
}

function pauseTimer() {
  state.timerState.isRunning = false;
  state.timerState.endTime = null;
  clearInterval(tickInterval);
  tickInterval = null;
  updateTray('');
  persistState();
  renderTimer();
}

function resetTimer() {
  const wasRunning = state.timerState.isRunning;
  clearInterval(tickInterval);
  tickInterval = null;
  state.timerState.isRunning = false;
  state.timerState.endTime = null;
  state.timerState.remainingSeconds = modeDuration(state.timerState.mode);
  updateTray('');
  persistState();
  renderTimer();
}

function switchMode(mode) {
  if (state.timerState.isRunning) return;
  state.timerState.mode = mode;
  state.timerState.remainingSeconds = modeDuration(mode);
  persistState();
  renderAll();
}

function completeSession() {
  clearInterval(tickInterval);
  tickInterval = null;

  const completedMode = state.timerState.mode;

  playChime();

  if (completedMode === 'focus') {
    state.timerState.completedFocusSessions++;
    const key = todayKey();
    if (!state.sessionHistory[key]) {
      state.sessionHistory[key] = { focusSessionsCompleted: 0, tasksCompleted: 0 };
    }
    state.sessionHistory[key].focusSessionsCompleted++;

    // Determine next mode
    const isLongBreak =
      state.timerState.completedFocusSessions % state.settings.longBreakInterval === 0;
    state.timerState.mode = isLongBreak ? 'longBreak' : 'shortBreak';
    window.electronAPI.showNotification(
      'Focus session complete!',
      `Time for a ${isLongBreak ? '15-minute' : '5-minute'} break.`
    );
  } else {
    state.timerState.mode = 'focus';
    window.electronAPI.showNotification(
      'Break over!',
      'Ready to start your next focus session.'
    );
  }

  state.timerState.isRunning = false;
  state.timerState.endTime = null;
  state.timerState.remainingSeconds = modeDuration(state.timerState.mode);
  updateTray('');
  persistState();
  renderAll();
}

// --- Task Logic ---
function addTask() {
  const text = $taskInput.value.trim();
  if (!text) return;

  state.tasks.push({
    id: crypto.randomUUID(),
    text,
    completed: false,
    createdAt: new Date().toISOString(),
  });

  $taskInput.value = '';
  persistState();
  renderAll();
}

function toggleTask(id) {
  const task = state.tasks.find((t) => t.id === id);
  if (!task) return;

  task.completed = !task.completed;

  if (task.completed) {
    const key = todayKey();
    if (!state.sessionHistory[key]) {
      state.sessionHistory[key] = { focusSessionsCompleted: 0, tasksCompleted: 0 };
    }
    state.sessionHistory[key].tasksCompleted++;
  }

  // If the completed task was the current one, deselect it
  if (task.completed && state.currentTaskId === id) {
    state.currentTaskId = null;
  }

  persistState();
  renderAll();
}

function deleteTask(id) {
  state.tasks = state.tasks.filter((t) => t.id !== id);
  if (state.currentTaskId === id) {
    state.currentTaskId = null;
  }
  persistState();
  renderAll();
}

function selectTask(id) {
  if (state.currentTaskId === id) {
    state.currentTaskId = null;
  } else {
    state.currentTaskId = id;
  }
  persistState();
  renderAll();
}

// --- Event Listeners ---
$btnStart.addEventListener('click', startTimer);
$btnPause.addEventListener('click', pauseTimer);
$btnReset.addEventListener('click', resetTimer);

$modeBtns.forEach((btn) => {
  btn.addEventListener('click', () => switchMode(btn.dataset.mode));
});

$taskInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') addTask();
});

document.getElementById('btn-add').addEventListener('click', addTask);

// --- Init ---
loadState().then(() => {
  renderAll();
  if (state.timerState.isRunning) {
    tickInterval = setInterval(tick, 250);
  }
});
