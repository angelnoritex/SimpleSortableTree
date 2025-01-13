import { createContext } from 'react';

import {
	attachInstruction,
	extractInstruction,
} from '@atlaskit/pragmatic-drag-and-drop-hitbox/tree-item';
import { DropIndicator } from '@atlaskit/pragmatic-drag-and-drop-react-drop-indicator/tree-item';

import type { TreeContextValue, DependencyContextType } from './types';

export const TreeContext = createContext<TreeContextValue>({
	dispatch: () => {},
	uniqueContextId: Symbol('uniqueId'),
	getPathToItem: () => [],
	getMoveTargets: () => [],
	getChildrenOfItem: () => [],
	registerTreeItem: () => {},
});


export const DependencyContext = createContext<DependencyContextType>({
	DropIndicator: DropIndicator,
	attachInstruction: attachInstruction,
	extractInstruction: extractInstruction,
});


