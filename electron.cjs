const { app, BrowserWindow, globalShortcut, ipcMain } = require('electron');
const path = require('path');
const { pathToFileURL } = require('url');

const VITE_DEV_PORT = process.env.VITE_PORT || 5173;
const serverUrl = (relativePath) => pathToFileURL(path.join(__dirname, 'server', relativePath)).href;

async function loadServerModule(relativePath) {
  return import(serverUrl(relativePath));
}

async function ensureMainProcessDb() {
  const { connectDatabase } = await loadServerModule('db.js');
  const { ensureDefaultWorkflow } = await loadServerModule('services/workflowSeedService.js');

  await connectDatabase();
  await ensureDefaultWorkflow();
}

function registerWorkflowIpc() {
  ipcMain.handle('workflow:states:list', async () => {
    await ensureMainProcessDb();
    const { workflowRepository } = await loadServerModule('repositories/workflowRepository.js');
    return workflowRepository.listStates();
  });

  ipcMain.handle('workflow:transitions:list', async () => {
    await ensureMainProcessDb();
    const { workflowRepository } = await loadServerModule('repositories/workflowRepository.js');
    return workflowRepository.listTransitions();
  });

  ipcMain.handle('issues:create', async (event, payload) => {
    await ensureMainProcessDb();
    const { createIssue } = await loadServerModule('services/workflowService.js');
    return createIssue(payload);
  });

  ipcMain.handle('issues:transition', async (event, payload) => {
    await ensureMainProcessDb();
    const { transitionIssue } = await loadServerModule('services/workflowService.js');
    return transitionIssue(payload);
  });

  ipcMain.handle('issues:assign', async (event, payload) => {
    await ensureMainProcessDb();
    const { assignIssue } = await loadServerModule('services/workflowService.js');
    return assignIssue(payload);
  });

  ipcMain.handle('issues:estimate:update', async (event, payload) => {
    await ensureMainProcessDb();
    const { updateEstimate } = await loadServerModule('services/workflowService.js');
    return updateEstimate(payload);
  });

  ipcMain.handle('issues:comments:add', async (event, payload) => {
    await ensureMainProcessDb();
    const { addComment } = await loadServerModule('services/commentService.js');
    return addComment(payload);
  });
}

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  const isDev = process.env.NODE_ENV === 'development';

  if (isDev) {
    mainWindow.loadURL(`http://localhost:${VITE_DEV_PORT}`);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html'));
  }

  // Register zoom keyboard shortcuts
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.control || input.meta) {
      if (input.key === '=' || input.key === '+') {
        // Ctrl+= or Ctrl++ to zoom in
        const current = mainWindow.webContents.getZoomLevel();
        mainWindow.webContents.setZoomLevel(current + 0.5);
        event.preventDefault();
      } else if (input.key === '-') {
        // Ctrl+- to zoom out
        const current = mainWindow.webContents.getZoomLevel();
        mainWindow.webContents.setZoomLevel(current - 0.5);
        event.preventDefault();
      } else if (input.key === '0') {
        // Ctrl+0 to reset zoom
        mainWindow.webContents.setZoomLevel(0);
        event.preventDefault();
      }
    }
  });
}

app.whenReady().then(() => {
  registerWorkflowIpc();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
