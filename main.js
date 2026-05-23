const { app, BrowserWindow, Tray, Menu, Notification, ipcMain, nativeImage } = require('electron');
const path = require('path');
const fs = require('fs');

const DATA_PATH = path.join(app.getPath('userData'), 'pomodoro-data.json');

const DEFAULT_DATA = {
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
  windowState: { x: null, y: null, width: 420, height: 650 },
};

let mainWindow = null;
let tray = null;
let isQuitting = false;

function loadData() {
  try {
    const raw = fs.readFileSync(DATA_PATH, 'utf-8');
    return { ...DEFAULT_DATA, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_DATA };
  }
}

function saveData(data) {
  try {
    fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
    return true;
  } catch {
    return false;
  }
}

function createWindow() {
  const data = loadData();
  const { windowState } = data;

  mainWindow = new BrowserWindow({
    width: windowState.width,
    height: windowState.height,
    x: windowState.x ?? undefined,
    y: windowState.y ?? undefined,
    minWidth: 360,
    minHeight: 550,
    title: 'Pomodoro Timer',
    resizable: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));

  mainWindow.on('close', (e) => {
    if (!isQuitting) {
      e.preventDefault();
      mainWindow.hide();
    }
  });

  mainWindow.on('move', () => {
    const [x, y] = mainWindow.getPosition();
    const current = loadData();
    current.windowState.x = x;
    current.windowState.y = y;
    saveData(current);
  });

  mainWindow.on('resize', () => {
    const [width, height] = mainWindow.getSize();
    const current = loadData();
    current.windowState.width = width;
    current.windowState.height = height;
    saveData(current);
  });
}

function createTray() {
  // Create a simple 16x16 tomato-colored circle as tray icon
  const icon = nativeImage.createFromDataURL(
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAA' +
    'UklEQVQ4T2P8z8BQz0AEGFBQUEA909PT/8MwCGRlZTXgwP//Ywaqqqoy4ML/GairKybE' +
    'AKhN/xmIMQAqjxuQ24QmJiYGuAGPHz/mI2QbkQYg5QIAuqgfmq4gDtMAAAAASUVORK5CYII='
  );
  tray = new Tray(icon);
  tray.setToolTip('Pomodoro Timer');

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show Window',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        }
      },
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        isQuitting = true;
        app.quit();
      },
    },
  ]);

  tray.setContextMenu(contextMenu);

  tray.on('click', () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        mainWindow.show();
        mainWindow.focus();
      }
    }
  });
}

function registerIpcHandlers() {
  ipcMain.handle('get-data', () => loadData());

  ipcMain.handle('save-data', (_event, data) => saveData(data));

  ipcMain.handle('show-notification', (_event, title, body) => {
    if (Notification.isSupported()) {
      new Notification({ title, body }).show();
    }
  });

  ipcMain.handle('update-tray', (_event, text) => {
    if (tray) {
      tray.setTitle(text);
    }
  });
}

app.whenReady().then(() => {
  registerIpcHandlers();
  createWindow();
  createTray();
});

app.on('window-all-closed', () => {
  // Keep app alive in tray on macOS
});

app.on('before-quit', () => {
  isQuitting = true;
});

app.on('activate', () => {
  if (mainWindow) {
    mainWindow.show();
  }
});
