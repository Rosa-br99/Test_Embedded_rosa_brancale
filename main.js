const { app, BrowserWindow, ipcMain } = require('electron');
const { SerialPort, ReadlineParser } = require('serialport');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  }); 

  mainWindow.loadFile('index.html');
}


app.on('ready', () => {
  createWindow();

  const port = new SerialPort({ path: 'COM4', baudRate: 9600 }, (err) => {
    if (err) {
      console.error(`Error opening port: ${err.message}`);
      return;
    }
  });

  const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));

  ipcMain.on('send-command', (event, command) => {
    console.log(`Sending command: ${command}`);
    port.write(`${command}\n`, (err) => {
      if (err) {
        console.error(`Error writing to port: ${err.message}`);
      }
    });
  });

  parser.on('data', (data) => {
    console.log(`Received data: ${data}`);
    mainWindow.webContents.send('command-response', {
      command: data.split('+')[0],
      response: data,
    });
  });

  port.on('error', (err) => {
    console.error(`Serial port error: ${err.message}`);
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
