import { createContext } from 'react';

import {
	attachInstruction,
	extractInstruction,
} from '@atlaskit/pragmatic-drag-and-drop-hitbox/tree-item';
import { DropIndicator } from '@atlaskit/pragmatic-drag-and-drop-react-drop-indicator/tree-item';

//mport type { TreeContextValue, DependencyContextType } from './types';

/**
 * @typedef {import("./types").TreeContextValue} TreeContextValue
 * @typedef {import("./types").DependencyContextType} DependencyContextType
 * @typedef {import("./types").TreeState} TreeState
 */

/**
 * @type {TreeContextValue}
 */
export const TreeContext = createContext({
	dispatch: () => {},
	uniqueContextId: Symbol('uniqueId'),
	getPathToItem: () => [],
	getMoveTargets: () => [],
	getChildrenOfItem: () => [],
	registerTreeItem: () => {},
});


/**
 * @type {DependencyContextType}
 */
export const DependencyContext = createContext({
	DropIndicator: DropIndicator,
	attachInstruction: attachInstruction,
	extractInstruction: extractInstruction,
});


