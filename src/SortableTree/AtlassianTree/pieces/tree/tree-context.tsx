import { createContext } from 'react';
import type {  TreeContextValue , DependencyContext as DependencyContextType} from '../../types';
import {
	attachInstruction,
	extractInstruction,
} from '@atlaskit/pragmatic-drag-and-drop-hitbox/tree-item';
import { DropIndicator } from '@atlaskit/pragmatic-drag-and-drop-react-drop-indicator/tree-item';


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
 