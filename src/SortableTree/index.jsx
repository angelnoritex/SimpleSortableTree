//import SortableTree from './v0'
//import SortableTree from './Lucide'

import React, {  useEffect, useReducer, useState } from "react"
import SortableTree from "./AtlassianTree"
import { treeStateReducer } from "./AtlassianTree/redux";
import { createNodeKey } from "./AtlassianTree/redux";





/**
 * NewMenuTree component
 * 
 * @param {Object} initialState - The initial state of the menu tree.
 * @param {Function} addNewMenu - Function to add a new menu item.
 * @param {Object} props - The properties passed to the component.
 * @param {Object} state - The current state of the component.
 * @param {Function} setState - Function to update the state of the component.
 * @param {Array} treeData - The data representing the menu tree.
 * @param {Function} setTreeData - Function to update the menu tree data.
 * 
 * @returns {JSX.Element} The rendered NewMenuTree component.
 */
export default function NewMenuTree({ selectedLink, treeData, saveMenu }) {

  //if(treeData.length > 0 && !treeData[0].id) 
  createNodeKey(treeData, null)

  const [TreeState, updateTreeState] = useReducer(treeStateReducer, { data: treeData, lastAction: null });


  // Get the JSON string from localStorage
  const [pasteable, setPasteable] = useState(null)

  const myObjectString = localStorage.getItem('saved_menu');
  useEffect(()=>{
    if(myObjectString){
      const myObject = JSON.parse(myObjectString);
      setPasteable(myObject)
    }
  },[myObjectString])

  const handlePaste = ()=>{
    updateTreeState({ type: 'paste', item:pasteable, itemId:TreeState.data.at(-1).id  })
  }

  return <>

  <SortableTree state={TreeState} updateState={updateTreeState} />

  {pasteable ? <button onClick={handlePaste} className="btn btn-primary">paste</button> : null}


</>


}


