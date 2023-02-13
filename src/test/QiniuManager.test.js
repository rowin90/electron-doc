/**
 * 测试七牛api
 */

const QiniuMa = require('../utils/QiniuManager')

const ak = 'NYYv3bAE1vmb1VunOKI9ls3owtUgRKluefpwvxFW'
const sk = 'Ep9k4dF4q29pJ96zU1tLrB94NRBBfvF6pm6nVaIx'
const localFile = '/Users/jerome/Desktop/zk.png'
const key = 'zk.png'


const manager = new QiniuMa(ak,sk,'electron-clouddoc')
// 上传
// manager.uploadFile(key,localFile).then(data =>{
//     console.log("-> data", data);
//
// }).catch(err=>{
//     console.log("-> err", err);
//
// })

// 获取域名
// manager.getBucketDomain().then(data =>{
//     console.log("-> data", data);
// }).catch(err=>{
//     console.log("-> err", err);
// })

// 下载
manager.downloadFile(key,'/Users/jerome/Desktop/zk.png').then(data =>{
    console.log("-> data", data);
}).catch(err =>{
    console.log("-> err", err);
})
