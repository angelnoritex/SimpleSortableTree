
import "./styles/index.css"
import SortableTree from "./SortableTree"

import ObjectTree from './treeObject.json'
import { useState } from "react";

function App() {

  const [treeData, setTreeData] = useState(ObjectTree);
  return (
    <div className="container">

      <div className='App'>
        <SortableTree treeData={treeData} setTreeData={setTreeData} />
      </div>
    </div>
  )
}

export default App
