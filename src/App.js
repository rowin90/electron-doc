import React, { useState } from 'react'

import { faPlus, faFileImport } from '@fortawesome/free-solid-svg-icons'
import FileSearch from './components/FileSearch'
import FileList from './components/FileList'
import BottomBtn from './components/BottomBtn'
import defaultFiles from './utils/defaultFiles';
import { v4 as uuidv4 } from 'uuid';

import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css'

function App() {

  const [ files, setFiles ] = useState({})

  const createNewFile = () => {
    const newID = uuidv4()
    const newFile = {
      id: newID,
      title: '',
      body: '## 请输出 Markdown',
      createdAt: new Date().getTime(),
      isNew: true,
    }
    setFiles({ ...files, [newID]: newFile })
  }

  // const importFiles = () => {
  //   remote.dialog.showOpenDialog({
  //     title: '选择导入的 Markdown 文件',
  //     properties: ['openFile', 'multiSelections'],
  //     filters: [
  //       {name: 'Markdown files', extensions: ['md']}
  //     ]
  //   }, (paths) => {
  //     if (Array.isArray(paths)) {
  //       // filter out the path we already have in electron store
  //       // ["/Users/liusha/Desktop/name1.md", "/Users/liusha/Desktop/name2.md"]
  //       const filteredPaths = paths.filter(path => {
  //         const alreadyAdded = Object.values(files).find(file => {
  //           return file.path === path
  //         })
  //         return !alreadyAdded
  //       })
  //       // extend the path array to an array contains files info
  //       // [{id: '1', path: '', title: ''}, {}]
  //       const importFilesArr = filteredPaths.map(path => {
  //         return {
  //           id: uuidv4(),
  //           title: basename(path, extname(path)),
  //           path,
  //         }
  //       })
  //       // get the new files object in flattenArr
  //       const newFiles = { ...files, ...flattenArr(importFilesArr)}
  //       // setState and update electron store
  //       setFiles(newFiles)
  //       saveFilesToStore(newFiles)
  //       if (importFilesArr.length > 0) {
  //         remote.dialog.showMessageBox({
  //           type: 'info',
  //           title: `成功导入了${importFilesArr.length}个文件`,
  //           message: `成功导入了${importFilesArr.length}个文件`,
  //         })
  //       }
  //     }
  //   })
  // }

  return (
    <div className="App container-fluid">
      <div className="row">
        <div className="col-3  left-panel">
          <FileSearch title="我的云文档" onFileSearch={()=>{}}/>
          <FileList files={defaultFiles}/>
          <div className="row no-gutters button-group">
            <div className="col">
              <BottomBtn
                text="新建"
                colorClass="btn-primary"
                icon={faPlus}
                onBtnClick={createNewFile}
              />
            </div>
            <div className="col">
              <BottomBtn
                text="导入"
                colorClass="btn-success"
                icon={faFileImport}
                onBtnClick={()=>{}}
              />
            </div>
          </div>
        </div>
        <div className="col-9 bg-dark right-panel">
          <h1> this is  right</h1>
        </div>
      </div>
    </div>
  );
}

export default App;
