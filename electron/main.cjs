// electron/main.cjs
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

// Impede que o Garbage Collector feche a janela
let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    frame: true, // Se quiseres a barra padrão do Windows (minimizar/fechar) deixa true
    backgroundColor: '#020617',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false, // Permite comunicação direta para facilitar
      webSecurity: false // Útil para carregar imagens locais se necessário
    },
    // Ícone da janela (se existir)
    icon: path.join(__dirname, '../public/favicon.ico')
  });

  // Em DESENVOLVIMENTO, carrega a URL do Vite
  // Em PRODUÇÃO (exe), carrega o ficheiro html
  const isDev = !app.isPackaged;
  
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    // Abre as ferramentas de dev para ver erros
    // mainWindow.webContents.openDevTools(); 
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});