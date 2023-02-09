// Modules to control application life and create native browser window
const {app, BrowserWindow, ipcMain} = require('electron')
// const path = require('path')
const isDev = require('electron-is-dev')

const {
    default: installExtension,
    REACT_DEVELOPER_TOOLS,
    REDUX_DEVTOOLS,

} = require('electron-devtools-installer')

const extensions = [REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS]


// Or if you can not use ES6 imports
app.whenReady().then(() => {

    extensions.forEach(extension => {
        try {
            installExtension(extension)
                .then((name) => console.log(`Added Extension:  ${name}`))
                .catch((err) => console.log('An error occurred: ', err));
        } catch (e) {
            console.error(e)
        }
    })

});

app.on('ready', () => {
    let mainWindow = new BrowserWindow({
        width: 1440,
        height: 768,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation:false
        }
    })

    let urlLocation = isDev ? 'http://localhost:3000':'xxx'
    mainWindow.loadURL(urlLocation)
    // mainWindow.webContents.openDevTools()

    // let secondWindow = new BrowserWindow({
    //   width:400,
    //   height:300,
    //   webPreferences:{
    //     nodeIntegration:true,
    //   },
    //   parent:mainWindow
    // })
    // secondWindow.loadFile('index.html')

    ipcMain.on('message', (event, arg) => {
        console.log("-> arg", arg);
        event.reply('reply','hello from main')
    })
})

// function createWindow () {
//   // Create the browser window.
//   const mainWindow = new BrowserWindow({
//     width: 800,
//     height: 600,
//     webPreferences: {
//       preload: path.join(__dirname, 'preload.js')
//     }
//   })
//
//   // and load the index.html of the app.
//   mainWindow.loadFile('index.html')
//
//   // Open the DevTools.
//   // mainWindow.webContents.openDevTools()
// }
// app.on('')
//
// // This method will be called when Electron has finished
// // initialization and is ready to create browser windows.
// // Some APIs can only be used after this event occurs.
// app.whenReady().then(() => {
//   createWindow()
//
//   app.on('activate', function () {
//     // On macOS it's common to re-create a window in the app when the
//     // dock icon is clicked and there are no other windows open.
//     if (BrowserWindow.getAllWindows().length === 0) createWindow()
//   })
// })
//
// // Quit when all windows are closed, except on macOS. There, it's common
// // for applications and their menu bar to stay active until the user quits
// // explicitly with Cmd + Q.
// app.on('window-all-closed', function () {
//   if (process.platform !== 'darwin') app.quit()
// })
//
// // In this file you can include the rest of your app's specific main process
// // code. You can also put them in separate files and require them here.
