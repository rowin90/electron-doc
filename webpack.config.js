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
