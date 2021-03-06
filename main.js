// Modules to control application life and create native browser window
const {app, BrowserWindow} = require('electron');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
let overlayWindow;

function createWindow () {

    createOverlay();

    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 400,
        height: 300,
        frame: false,
        transparent: true,
        titleBarStyle: 'hidden',
        backgroundColor: '#FFF',
        overlay: overlayWindow,
        webPreferences: {
            nodeIntegration: true,
            nodeIntegrationInWorker: true
        }
    });

    // and load the index.html of the app.
    mainWindow.loadFile('index.html');

    // Open the DevTools.
    // mainWindow.webContents.openDevTools();

    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null;
        overlayWindow.close();
        overlayWindow = null;
    });
}

function createOverlay() {
    // Create the overlay window.
    overlayWindow = new BrowserWindow({
        frame: false,
        fullscreen: true,
        transparent: true,
        alwaysOnTop: true,

        webPreferences: {
            nodeIntegration: true
        }
    });
    
    overlayWindow.setSkipTaskbar(true);
    overlayWindow.setIgnoreMouseEvents(true);
    overlayWindow.loadFile('overlay.html');
    overlayWindow.setOpacity(0);
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

app.commandLine.appendSwitch('high-dpi-support', 'true');
app.commandLine.appendSwitch('force-device-scale-factor', '1');

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow();
    }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
