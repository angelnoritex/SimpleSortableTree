import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { TreeNode } from './TreeNode.jsx';
import { findNodeById, removeNode, addChildToNode } from './utils.js';

/**
 * TODO: 
 * - [ ] Poder sacar a la raiz
 * - [ ] normalizar la id de busqueda
 * 
 */


export default function SortableTree({treeData, setTreeData}) {
  
  const [draggedId, setDraggedId] = useState(/** @type {string | null} */ (null));

  const handleDragStart = (/** @type {React.DragEvent} */ e, /** @type {string} */ _id) => {
    //console.log("drag start", _id);
    setDraggedId(_id);
  };

  const handleDragOver = (/** @type {React.DragEvent} */ e) => {
    if(e.target.getAttribute('value_id')){
      e.target.parentNode.style.backgroundColor = '#5050d370';

    }
    e.preventDefault();

  };

  const handleDrop = (/** @type {React.DragEvent} */ e, /** @type {string} */ targetId) => {

    e.preventDefault();
    if (!draggedId || draggedId === targetId) return;

    const [draggedNode] = findNodeById(treeData, draggedId);

    if (!draggedNode) return;
    
    const newTreeData = removeNode(treeData, draggedId);

    const [targetNode, targetParent] = findNodeById(newTreeData, targetId);

    if(!targetNode.children) targetNode.children = [];

    targetNode.children.push(draggedNode);
    
    /*
    if (targetParent) {
      const targetIndex = targetParent.findIndex((node) => node._id === targetId);
      targetParent.splice(targetIndex + 1, 0, draggedNode);
      }
      */
   setTreeData([...newTreeData]);
    
    e.target.style.backgroundColor = 'initial'
    e.target.parentNode.style.backgroundColor = 'initial'
    setDraggedId(null);
  };

  const handleAddChild = (/** @type {string} */ parentId) => {
    const newId = `${parentId}-${Date.now()}`;
    const newNode = {
      _id: newId,
      label: `New Item ${newId}`,
    };

    setTreeData(addChildToNode(treeData, parentId, newNode));
  };

  const handleAddRoot = () => {
    const newId = `root-${Date.now()}`;
    setTreeData([
      ...treeData,
      {
        _id: newId,
        label: `Root Item ${newId}`,
      },
    ]);
  };

  const handleDelete = (/** @type {string} */ _id) => {
    setTreeData(removeNode(treeData, _id));
  };

  return (
    <div >
      {/*
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Sortable Tree</h1>
        <button
          onClick={handleAddRoot}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Root Item
        </button>
      </div>      
      */}
      
      <div >
        {treeData.map((node, key) => (
          <TreeNode
            key={`${node.title}-${node._id}-${key}`}
            {...node}
            level={0}
            onAddChild={handleAddChild}
            onDelete={handleDelete}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          />
        ))}
      </div>
    </div>
  );
}