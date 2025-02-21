import type { Instruction } from '@atlaskit/pragmatic-drag-and-drop-hitbox/tree-item';
import {
	attachInstruction,
	extractInstruction,
} from '@atlaskit/pragmatic-drag-and-drop-hitbox/tree-item';
import { DropIndicator } from '@atlaskit/pragmatic-drag-and-drop-react-drop-indicator/tree-item';


export type TreeItem = {
	id: string;
	_id: string;
	copys: number;
	slug: string;
	title: string;
	children: TreeItem[];
	expanded?: boolean;
};

export type TreeState = {
	lastAction: TreeAction | null;
	data: TreeItem[];
};

type ActionType = 'instruction' | 'toggle'| 'expand'| 'collapse'| 'remove'| 'copy'| 'insertAtLast'| 'modal-move' | 'update'

export type TreeAction = {
			type: ActionType;
			itemId: string;
			instruction: Instruction;
			targetId: string;
			index: number
			item: TreeItem
	  }

    
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



export type DependencyContextType = {
	DropIndicator: typeof DropIndicator;
	attachInstruction: typeof attachInstruction;
	extractInstruction: typeof extractInstruction;
};

