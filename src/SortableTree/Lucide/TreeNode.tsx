import React, { useState } from 'react';
import { ChevronRight, ChevronDown, GripVertical, Plus, Trash } from 'lucide-react';

interface TreeNodeProps {
  id: string;
  label: string;
  children?: TreeNodeItem[];
  level: number;
  onAddChild: (parentId: string) => void;
  onDelete: (id: string) => void;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, id: string) => void;
}

export interface TreeNodeItem {
  id: string;
  label: string;
  children?: TreeNodeItem[];
}

export function TreeNode({
  id,
  label,
  children,
  level,
  onAddChild,
  onDelete,
  onDragStart,
  onDragOver,
  onDrop
}: TreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="select-none">
      <div
        className="flex items-center gap-1 p-2 hover:bg-gray-100 rounded-lg group"
        onDragOver={onDragOver}
        onDrop={(e) => onDrop(e, id)}
        style={{ marginLeft: `${level * 20}px` }}
      >
        <div
          className="cursor-move opacity-0 group-hover:opacity-100 transition-opacity"
          draggable
          onDragStart={(e) => onDragStart(e, id)}
        >
          <GripVertical className="w-4 h-4 text-gray-400" />
        </div>
        
        {children?.length ? (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-gray-200 rounded"
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
        ) : (
          <div className="w-6" />
        )}
        
        <span className="flex-grow">{label}</span>
        
        <button
          onClick={() => onAddChild(id)}
          className="p-1 hover:bg-gray-200 rounded opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Plus className="w-4 h-4 text-green-600" />
        </button>
        
        <button
          onClick={() => onDelete(id)}
          className="p-1 hover:bg-gray-200 rounded opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Trash className="w-4 h-4 text-red-600" />
        </button>
      </div>

      {isExpanded && children?.map((child) => (
        <TreeNode
          key={child.id}
          {...child}
          level={level + 1}
          onAddChild={onAddChild}
          onDelete={onDelete}
          onDragStart={onDragStart}
          onDragOver={onDragOver}
          onDrop={onDrop}
        />
      ))}
    </div>
  );
}