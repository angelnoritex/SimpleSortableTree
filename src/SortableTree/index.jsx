//import SortableTree from './v0'
//import SortableTree from './Lucide'

import React, {  useReducer } from "react"
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



 

  return <>

  <SortableTree state={TreeState} updateState={updateTreeState} />


</>


}


