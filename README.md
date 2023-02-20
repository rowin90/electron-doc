# 目录结构
- react 打包用 cra 自带的 react-scripts
- electron 代码用单独的 webpack 打包，打包进和 react 文件夹里面
```sh
├── assets      // electron 一些静态icon的文件，在pkg中有引用
├── build      // react 打包后项目
├── dist       // electron 打包后项目，里面包含安装包
├── main.js     // electron 主入口
├── package.json
├── public
├── settings    // 设置页面（web端） 一个单独的页面
├── src        // react项目
    ├── App.css
    ├── App.js
    ├── AppWindow.js
    ├── components
    ├── hooks
    ├── index.css
    ├── index.js
    ├── logo.svg
    ├── menuTemplate.js    // electron 菜单配置文件
    ├── reportWebVitals.js
    ├── setupTests.js
    ├── test
    └── utils

└── webpack.config.js  // 单独webpack 打包 electron 代码的配置文件

```

# 启动
1. npm run dev 启动 react 和 electron
2. npm run onlyEle 开发环境实时监听对应文件，仅重启 electron

# 外部配置
1. 七牛云的配置接口，封装在 utils/QiniuManager中，如果相关api有变化，请及时更新
2. 相关账密，是保存在electron-store本地，可以启动项目后，点击设置，来更新账密

# electron-builder 打包
- [electron.build](https://www.electron.build/configuration/publish.html)
0. npm run pack 
1. npm i electron-builder -D
    ![打包后的结果](http://rqbv29g37.hd-bkt.clouddn.com/electron/electron-build.png)
- 打包包括
    - 打包 react 界面，npm run build
    - 打包 electron 相关的
        - electron 相关，用 webpack 优化下文件，主入口 main.js，直接打到和react项目同一个文件夹build中， npm run buildMain
```js
// $ package.json
{
    "pack": "electron-builder --dir",  // 可以直接打包成 安装后的应用程序，方便测试
    "dist": "electron-builder", // 打包成安装包
    "prepack": "npm run build && npm run buildMain",
    "predist": "npm run build && npm run buildMain",
    "build": "react-scripts build",
    "buildMain": "webpack",
}
```
- bundle electron 文件，用webpack优化下，直接打到和react项目同一个文件夹build中
```js
/**
 * 打包 electron 主进程相关js文件，作为 electron 的起始入口。如 main,menuTemplate
 */

const path = require('path')

module.exports = {
    target: 'electron-main',
    entry: './main.js',
    mode:'production',
    output: {
        path: path.resolve(__dirname, './build'),
        filename: 'main.js'
    },
    node: { // 这个感觉不打开也行
        __dirname: false
    }
}

```
- 记得在 pkg 中设置 electron 入口文件, 打包后的地址
```js
 "extraMetadata": {
      "main": "./build/main.js"  // 修改 electron 打包后的主入口
    },
 "extends": null,  // 修改 electron 打包后的主入口
```


# 优化打包产物
### 反解析打包产物
1. 打包后，主要的文件，是 app.asar ， asar 是 electron 的一个加密文件，保护源码，可以使用 asar 反解析
2. npm i asar -g 可以反解析 app.asar 看看打包里面
```sh
 asar extract ./dist/mac/七牛云文档.app/Contents/Resources/app.asar ./app
```
3. 反解析打包后的产物
    1. Resources
        1. App.asar
            1. react build 静态文件
            2. node_modules
            3. Electron主进程代码

### 优化思路
1. electron 不会打包 devDependencies,所以单独的react中的依赖，全部放在 devDependencies 中；如果是主进程需要的，还是要在 dependencies 中，node_module要打进去
- [dependencies与devDependencies貌似一点区别都没有](https://www.zhihu.com/question/310545060)
2. 主进程的代码，main.js 可以用 webpack 直接打一个 bundle 和 react build 的放在一起
```js
"homepage": "./",  // 修改 cra 生成的静态文件（默认是绝对路径），修改为相对路径
"build": {
    "appId": "cloudDoc",
    "productName": "七牛云文档",
    "copyright": "Copyright © 2023 ${author}",
    "files": [  // 声明需要 electron 打包的文件，集成在 app.asar 中
      "build/**/*",  // react 打包的文件
      "dist/**/*",   // 打包出的 应用 
      "node_modules/**/*", // 主进程中的依赖，直接放进去
      "settings/**/*",  // 七牛云项目，业务中的 “设置”页面（单独的静态文件）
      "package.json"
    ],
    "directories": {
      "buildResources": "assets"  // 静态资源的目录，如小icon
    },
    "extraMetadata": {
      "main": "./build/main.js"  // 修改 electron 打包后的主入口
    },
    "publish": [
      "github"
    ],
    "extends": null,  // 修改 electron 打包后的主入口
    "mac": {
      "category": "public.app-category.productivity",  // mac 下的应用程序的 分类
      "artifactName": "${productName}-${version}-${arch}.${ext}"
    },
    "dmg": {
      "background": "assets/appdmg.png", // 到 assets 下找到文件
      "icon": "assets/icon.icns",
      "iconSize": 100,
      "contents": [
        {
          "x": 380,
          "y": 280,
          "type": "link",
          "path": "/Applications"
        },
        {
          "x": 110,
          "y": 280,
          "type": "file"
        }
      ],
      "window": {
        "width": 500,
        "height": 500
      }
    },
    "win": {
      "target": [
        "msi",
        "nsis"
      ],
      "icon": "assets/icon.ico",
      "artifactName": "${productName}-Web-Setup-${version}.${ext}",
      "publisherName": "raoju"
    },
    "nsis": {
      "allowToChangeInstallationDirectory": true,
      "oneClick": false,
      "perMachine": false
    }
  }
```

# 部署
1. 托管到github中，需要 github Token
2. 执行publish，会在github上生成 draft 草稿，再在github上发布
```js
{
     // TOKEN 加在环境变量中,???中自己生成
     "release": "cross-env GH_TOKEN=??? electron-builder",
    "prerelease": "npm run build && npm run buildMain",
}
```

# electron-updater 自动化更新
> TODO 本地调试自动更新(未完成)
1. npm i electron-updater -D
```js

// main.js
const { autoUpdater } = require('electron-updater')

const checkUpdate = () => {
    if(isDev){
        // 本地调试自动更新，手动指定加载对应的更新配置文件
        autoUpdater.updateConfigPath = path.join(__dirname,'dev-app-update.yml')
    }
    autoUpdater.autoDownload =  false
    autoUpdater.checkForUpdatesAndNotify()

    autoUpdater.on('error',error =>{
        dialog.showErrorBox('Error: ',error === null?"unknown":(error.stack))
    })

    autoUpdater.on('update-available',()=>{
        dialog.showMessageBox({
            type:'info',
            title:'应用有新的版本',
            message:'发现新版本，是否现在更新',
            buttons:['是','否'],
        },(buttonIndex)=>{
            if(buttonIndex === 0){
                autoUpdater.downloadUpdate()
            }

            autoUpdater.on('download-progress', (progressObj) => {
                let log_message = "Download speed: " + progressObj.bytesPerSecond;
                log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
                log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
                console.log(log_message);
            })

            autoUpdater.on('update-downloaded', (info) => {
                console.log('Update downloaded');
            })
        })
    })

}


// 在 ready 时，检查
app.on('ready', () => {
    // 检查自动更新
    checkUpdate()
    
    // ...
})
```
- dev-app-update.yml 用于本地测试自动更新
```js
# 开发环境，测试自动更新，配置文件
owner:rowin90
repo:electron-doc
provider:github

```
