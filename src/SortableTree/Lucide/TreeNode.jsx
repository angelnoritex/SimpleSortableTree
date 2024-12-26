import React, { useState } from 'react';
import { ChevronRight, ChevronDown, GripVertical, Plus, Trash } from 'lucide-react';
//import { TreeNodeControls } from './TreeNodeControls';

/**
 * @typedef {import('../utils/treeUtils').TreeNodeItem} TreeNodeItem
 */

/**
 * @param {Object} props
 * @param {string} props._id
 * @param {string} props.label
 * @param {TreeNodeItem[]} [props.children]
 * @param {number} props.level
 * @param {(parentId: string) => void} props.onAddChild
 * @param {(_id: string) => void} props.onDelete
 * @param {(e: React.DragEvent, _id: string) => void} props.onDragStart
 * @param {(e: React.DragEvent) => void} props.onDragOver
 * @param {(e: React.DragEvent, _id: string) => void} props.onDrop
 */
export function TreeNode({
  _id,
  title,
  children,
  level,
  onAddChild,
  onDelete,
  onDragStart,
  onDragOver,
  onDrop
}) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div style={{
        marginTop: ".5rem",
        marginBottom: ".5rem",
        
    }}>
      <div
        onDragOver={onDragOver}
        value_id={_id}
        onDragLeave={(e) => e.target.style.backgroundColor = 'initial'}
        onDrop={(e) => onDrop(e, _id)}
        style={{ 
          marginLeft: `${level * 20}px`,
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem',
          padding: '0.5rem',
          cursor: "pointer",
          transition: 'background-color 0.2s',
          ':hover': {
            backgroundColor: '#f3f4f6'
          },
          boxShadow: "1px 3px 4px 1px gray"
        }}
      >
        <div
          draggable
          onDragStart={(e) => onDragStart(e, _id)}
          style={{
            cursor: 'move',
            opacity: 0,
            transition: 'opacity 0.2s',
            ':hover': {
              opacity: 1
            }
          }}
        >
          <GripVertical style={{ width: '1rem', height: '1rem', color: '#9ca3af' }} />
        </div>
        
        {children?.length ? (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            style={{
              padding: '0.25rem',
              borderRadius: '0.25rem',
              transition: 'background-color 0.2s',
              ':hover': {
                backgroundColor: '#e5e7eb'
              }
            }}
          >
            {isExpanded ? (
              <ChevronDown style={{ width: '1rem', height: '1rem' }} />
            ) : (
              <ChevronRight style={{ width: '1rem', height: '1rem' }} />
            )}
          </button>
        ) : (
          <div style={{ width: '1.5rem' }} />
        )}
        
        <span style={{ flexGrow: 1 }}>{title} - {_id}</span>
        
        {/*
         
        <TreeNodeControls
          _id={_id}
          onAddChild={onAddChild}
          onDelete={onDelete}
        />
         */}

      </div>

      {isExpanded && children?.map((child, key) => (
        <TreeNode
            key={`${title}-${_id}-${key}`}
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