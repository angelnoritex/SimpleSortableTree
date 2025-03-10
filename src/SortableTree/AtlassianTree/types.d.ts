import type { Instruction } from '@atlaskit/pragmatic-drag-and-drop-hitbox/tree-item';
import {
	attachInstruction,
	extractInstruction,
} from '@atlaskit/pragmatic-drag-and-drop-hitbox/tree-item';
import { DropIndicator } from '@atlaskit/pragmatic-drag-and-drop-react-drop-indicator/tree-item';


export type TreeContextValue = {
  dispatch: (action: TreeAction) => void;
  uniqueContextId: Symbol;
  getPathToItem: (itemId: string) => string[];
  getMoveTargets: ({ itemId }: { itemId: string }) => TreeItem[];
  getChildrenOfItem: (itemId: string) => TreeItem[];
  registerTreeItem: (args: {
    itemId: string;
    element: HTMLElement;
    actionMenuTrigger: HTMLElement;
  }) => void;
};

export type TreeItem = {
	id: string;
	isDraft?: boolean;
	children: TreeItem[];
	isOpen?: boolean;
};

export type TreeState = {
	lastAction: TreeAction | null;
	data: TreeItem[];
};

export type TreeAction =
    | {
            type: 'instruction';
            instruction: Instruction;
            itemId: string;
            targetId: string;
      }
    | {
            type: 'toggle';
            itemId: string;
      }
    | {
            type: 'expand';
            itemId: string;
      }
    | {
            type: 'collapse';
            itemId: string;
      }
    | { type: 'modal-move'; itemId: string; targetId: string; index: number };


export type DependencyContext = {
  DropIndicator: typeof DropIndicator;
  attachInstruction: typeof attachInstruction;
  extractInstruction: typeof extractInstruction;
};


    