// Modules to control application life and create native browser window
const {app, ipcMain,Menu,dialog} = require('electron')
const AppWindow = require('./src/AppWindow')
const path = require('path')
const isDev = require('electron-is-dev')
const menuTemplate = require('./src/menuTemplate')
const QiniuManager = require('./src/utils/QiniuManager')
const Store = require('electron-store')
const settingsStore = new Store({ name: 'Settings'})
const fileStore = new Store({name: 'Files Data'})
let mainWindow, settingsWindow

// 创建七牛云实例
const createManager = () => {
    const accessKey = settingsStore.get('accessKey')
    const secretKey = settingsStore.get('secretKey')
    const bucketName = settingsStore.get('bucketName')
    return new QiniuManager(accessKey, secretKey, bucketName)
}


const {
    default: installExtension,
    REACT_DEVELOPER_TOOLS,
    REDUX_DEVTOOLS,

} = require('electron-devtools-installer')

const extensions = [REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS]


// Or if you can not use ES6 imports
// app.whenReady().then(() =>import useContextMenu from './src/hooks/useContextMenu';
//  {
//
//     extensions.forEach(extension => {
//         try {
//             installExtension(extension)
//                 .then((name) => console.log(`Added Extension:  ${name}`))
//                 .catch((err) => console.log('An error occurred: ', err));
//         } catch (e) {
//             console.error(e)
//         }
//     })
//
// });

app.on('ready', () => {
    let mainWindowConfig = {
        width: 1000,
        height: 768,
    }

    let urlLocation = isDev ? 'http://localhost:3000':`file://${path.join(__dirname, './index.html')}`
    mainWindow = new AppWindow(mainWindowConfig, urlLocation)
    mainWindow.on('closed', () => {
        mainWindow = null
    })
    mainWindow.webContents.openDevTools()
    // 加载 remote 模块
    require('@electron/remote/main').initialize()
    require("@electron/remote/main").enable(mainWindow.webContents)

    // set useMenu
    const menu = Menu.buildFromTemplate(menuTemplate)
    Menu.setApplicationMenu(menu)

    //  打开设置窗口
    ipcMain.on('open-settings-window', () => {
        const settingsWindowConfig = {
            width: 500,
            height: 400,
            parent: mainWindow
        }
        const settingsFileLocation = `file://${path.join(__dirname, './settings/settings.html')}`
        settingsWindow = new AppWindow(settingsWindowConfig, settingsFileLocation)
        settingsWindow.removeMenu()
        settingsWindow.on('closed', () => {
            settingsWindow = null
        })
    })

    // 下载七牛云文件
    ipcMain.on('download-file', (event, data) => {
        const manager = createManager()
        const filesObj = fileStore.get('files')
        const { key, path, id } = data
        manager.getStat(data.key).then((resp) => {
            const serverUpdatedTime = Math.round(resp.putTime / 10000)
            const localUpdatedTime = filesObj[id].updatedAt
            if (serverUpdatedTime > localUpdatedTime || !localUpdatedTime) {
                manager.downloadFile(key, path).then(() => {
                    mainWindow.webContents.send('file-downloaded', {status: 'download-success', id})
                })
            } else {
                mainWindow.webContents.send('file-downloaded', {status: 'no-new-file', id})
            }
        }, (error) => {
            if (error.statusCode === 612) {
                mainWindow.webContents.send('file-downloaded', {status: 'no-file', id})
            }
        })

    })

    ipcMain.on('upload-all-to-qiniu', () => {
        mainWindow.webContents.send('loading-status', true)
        const manager = createManager()
        const filesObj = fileStore.get('files') || {}
        const uploadPromiseArr = Object.keys(filesObj).map(key => {
            const file = filesObj[key]
            return manager.uploadFile(`${file.title}.md`, file.path)
        })
        Promise.all(uploadPromiseArr).then(result => {
            console.log(result)
            // show uploaded message
            dialog.showMessageBox({
                type: 'info',
                title: `成功上传了${result.length}个文件`,
                message: `成功上传了${result.length}个文件`,
            })
            mainWindow.webContents.send('files-uploaded')
        }).catch(() => {
            dialog.showErrorBox('同步失败', '请检查七牛云参数是否正确')
        }).finally(() => {
            mainWindow.webContents.send('loading-status', false)
        })
    })

    // 监听自动上传文件
    ipcMain.on('upload-file', (event, data) => {
        const manager = createManager()
        manager.uploadFile(data.key, data.path).then(data => {
            console.log('上传成功', data)
            mainWindow.webContents.send('active-file-uploaded')
        }).catch(() => {
            dialog.showErrorBox('同步失败', '请检查七牛云参数是否正确')
        })
    })

    // 修改菜单同步状态的勾选
    ipcMain.on('config-is-saved', () => {
        // watch out menu items index for mac and windows
        let qiniuMenu = process.platform === 'darwin' ? menu.items[3] : menu.items[2]
        const switchItems = (toggle) => {
            [1, 2, 3].forEach(number => {
                qiniuMenu.submenu.items[number].enabled = toggle
            })
        }
        const qiniuIsConfiged =  ['accessKey', 'secretKey', 'bucketName'].every(key => !!settingsStore.get(key))
        if (qiniuIsConfiged) {
            switchItems(true)
        } else {
            switchItems(false)
        }
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
