
import "./styles/index.css"
import SortableTree from "./SortableTree"
import { treeStateReducer } from "./SortableTree/AtlassianTree/utils";
import ObjectTree from './treeObject.json'
import { useState, useReducer } from "react";


const createNodeKey = (obj, parentId)=>{
  obj.map((e,key)=>{
    e.id = parentId ? parentId +'_'+ key:  key
    if(e.children){
      createNodeKey(e.children, `${parentId ? `${parentId}_${key}` : key}`)
    }
  })
}


function App() {

  createNodeKey(ObjectTree)

// const [treeData, setTreeData] = useState(ObjectTree);
  const [state, updateState] = useReducer(treeStateReducer,  { data: ObjectTree, lastAction: null });

  return (
    <div className="container">
      <div className='App'>
        <SortableTree state={state} updateState={updateState} />
      </div>
    </div>
  )
}

export default App
