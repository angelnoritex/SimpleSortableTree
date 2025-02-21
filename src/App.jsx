
import "./styles/index.css"
import SortableTree from "./SortableTree"

import ObjectTree from './treeObject.json'




function App() {


  return (
    <div className="container">
      <div className='App'>
        <SortableTree treeData={ObjectTree} />
      </div>
    </div>
  )
}

export default App
