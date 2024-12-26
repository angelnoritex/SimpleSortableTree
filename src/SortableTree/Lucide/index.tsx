import React, { useState } from 'react';
import { TreeNode, TreeNodeItem } from './TreeNode.tsx';
import { Plus } from 'lucide-react';

const initialData: TreeNodeItem[] = [
  {
    id: '1',
    label: 'Root Item 1',
    children: [
      { id: '1-1', label: 'Child 1.1' },
      { id: '1-2', label: 'Child 1.2' },
    ],
  },
  {
    id: '2',
    label: 'Root Item 2',
    children: [
      { id: '2-1', label: 'Child 2.1' },
      { id: '2-2', label: 'Child 2.2' },
    ],
  },
];

export default function SortableTree({treeData, setTreeData}) {
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const findNodeById = (
    nodes: TreeNodeItem[],
    id: string
  ): [TreeNodeItem | null, TreeNodeItem[] | null] => {
    for (const node of nodes) {
      if (node.id === id) return [node, nodes];
      if (node.children) {
        const [found, parent] = findNodeById(node.children, id);
        if (found) return [found, parent];
      }
    }
    return [null, null];
  };

  const removeNode = (nodes: TreeNodeItem[], id: string): TreeNodeItem[] => {
    return nodes.filter((node) => {
      if (node.id === id) return false;
      if (node.children) {
        node.children = removeNode(node.children, id);
      }
      return true;
    });
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) return;

    const [draggedNode] = findNodeById(treeData, draggedId);
    if (!draggedNode) return;

    const newTreeData = removeNode(treeData, draggedId);
    const [targetNode, targetParent] = findNodeById(newTreeData, targetId);

    if (targetParent) {
      const targetIndex = targetParent.findIndex((node) => node.id === targetId);
      targetParent.splice(targetIndex + 1, 0, draggedNode);
      setTreeData([...newTreeData]);
    }

    setDraggedId(null);
  };

  const handleAddChild = (parentId: string) => {
    const newId = `${parentId}-${Date.now()}`;
    const newNode: TreeNodeItem = {
      id: newId,
      label: `New Item ${newId}`,
    };

    const addChildToNode = (nodes: TreeNodeItem[]): TreeNodeItem[] => {
      return nodes.map((node) => {
        if (node.id === parentId) {
          return {
            ...node,
            children: [...(node.children || []), newNode],
          };
        }
        if (node.children) {
          return {
            ...node,
            children: addChildToNode(node.children),
          };
        }
        return node;
      });
    };

    setTreeData(addChildToNode(treeData));
  };

  const handleAddRoot = () => {
    const newId = `root-${Date.now()}`;
    setTreeData([
      ...treeData,
      {
        id: newId,
        label: `Root Item ${newId}`,
      },
    ]);
  };

  const handleDelete = (id: string) => {
    setTreeData(removeNode(treeData, id));
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
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
      
      <div className="bg-white rounded-xl shadow-lg p-6">
        {treeData.map((node, key ) => {
          const id = node._id ? node._id+"-"+ key :node.title+"-"+key           
          return (
            <TreeNode
              key={id}
              {...node}
              level={0}
              onAddChild={handleAddChild}
              onDelete={handleDelete}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            />
          )
        })}
      </div>
    </div>
  );
}