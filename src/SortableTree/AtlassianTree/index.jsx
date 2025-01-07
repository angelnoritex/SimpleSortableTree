// @ts-check
/**
 * @jsxRuntime classic
 * @jsx jsx
 * 
 */
import { useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react';

// eslint-disable-next-line @atlaskit/ui-styling-standard/use-compiled -- Ignored via go/DSP-18766
import { jsx } from '@emotion/react';
import memoizeOne from 'memoize-one';
import invariant from 'tiny-invariant';

import { triggerPostMoveFlash } from '@atlaskit/pragmatic-drag-and-drop-flourish/trigger-post-move-flash';

import * as liveRegion from '@atlaskit/pragmatic-drag-and-drop-live-region';
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { token } from '@atlaskit/tokens';

import {
	tree,
	treeStateReducer,
	treeData
} from './data/tree';

import { DependencyContext, TreeContext } from './pieces/tree/tree-context';
/**
 * @typedef {import("./types").TreeContextValue} TreeContextValue
 * @typedef {import("./types").TreeItem} TreeItemType
 * 
 */

import TreeItem from './pieces/tree/tree-item';



/**
 * @typedef {Object} CleanupFn
 * @property {() => void} cleanup - Function to clean up the registry.
 */

/**
 * Creates a registry for tree items.
 * @returns {{ registry: Map<string, { element: HTMLElement, actionMenuTrigger: HTMLElement }>, registerTreeItem: ({ itemId, element, actionMenuTrigger }: { itemId: string, element: HTMLElement, actionMenuTrigger: HTMLElement }) => CleanupFn }}
 */
function createTreeItemRegistry() {
	const registry = new Map();

	const registerTreeItem = ({ itemId, element, actionMenuTrigger }) => {
		registry.set(itemId, { element, actionMenuTrigger });
		return {
			cleanup: () => {
				registry.delete(itemId);
			}
		};
	};

	return { registry, registerTreeItem };
}

/**
 * Tree component.
 * @returns {JSX.Element}
 */
export default function Tree() {
	const [state, updateState] = useReducer(treeStateReducer, {data:treeData, lastAction:null});
	
	const ref = useRef(null);
	const { extractInstruction } = useContext(DependencyContext);

	const [{ registry, registerTreeItem }] = useState(createTreeItemRegistry);

	const { data, lastAction } = state;
	let lastStateRef = useRef(data);
	useEffect(() => {
		lastStateRef.current = data;
	}, [data]);

	useEffect(() => {
		if (lastAction === null) {
			return;
		}

		if (lastAction.type === 'modal-move') {
			const parentName = lastAction.targetId === '' ? 'the root' : `Item ${lastAction.targetId}`;

			liveRegion.announce(
				`You've moved Item ${lastAction.itemId} to position ${
					lastAction.index + 1
				} in ${parentName}.`,
			);

			const { element, actionMenuTrigger } = registry.get(lastAction.itemId) ?? {};
			if (element) {
				triggerPostMoveFlash(element);
			}

			/**
			 * Only moves triggered by the modal will result in focus being
			 * returned to the trigger.
			 */
			actionMenuTrigger?.focus();

			return;
		}

		if (lastAction.type === 'instruction') {
			const { element } = registry.get(lastAction.itemId) ?? {};
			if (element) {
				triggerPostMoveFlash(element);
			}

			return;
		}
	}, [lastAction, registry]);

	useEffect(() => {
		return () => {
			liveRegion.cleanup();
		};
	}, []);

	/**
	 * Returns the items that the item with `itemId` can be moved to.
	 *
	 * Uses a depth-first search (DFS) to compile a list of possible targets.
	 * @param {{ itemId: string }} param0 - The item ID.
	 * @returns {TreeItemType[]} The list of move targets.
	 */
	const getMoveTargets = useCallback(({ itemId }) => {
		const data = lastStateRef.current;

		const targets = [];

		const searchStack = Array.from(data);
		while (searchStack.length > 0) {
			const node = searchStack.pop();

			if (!node) {
				continue;
			}

			/**
			 * If the current node is the item we want to move, then it is not a valid
			 * move target and neither are its children.
			 */
			if (node.id === itemId) {
				continue;
			}

			/**
			 * Draft items cannot have children.
			 */
			if (node.isDraft) {
				continue;
			}

			targets.push(node);

			node.children.forEach((childNode) => searchStack.push(childNode));
		}

		return targets;
	}, []);

	/**
	 * Gets the children of the item with the given ID.
	 * @param {string} itemId - The item ID.
	 * @returns {TreeItemType[]} The children of the item.
	 */
	const getChildrenOfItem = useCallback((itemId) => {
		const data = lastStateRef.current;

		/**
		 * An empty string is representing the root
		 */
		if (itemId === '') {
			return data;
		}

		const item = tree.find(data, itemId);
		invariant(item);
		return item.children;
	}, []);

	const context = useMemo(
		() => ({
			dispatch: updateState,
			uniqueContextId: Symbol('unique-id'),
			// memoizing this function as it is called by all tree items repeatedly
			// An ideal refactor would be to update our data shape
			// to allow quick lookups of parents
			getPathToItem: memoizeOne(
				(targetId) => tree.getPathToItem({ current: lastStateRef.current, targetId }) ?? [],
			),
			getMoveTargets,
			getChildrenOfItem,
			registerTreeItem,
		}),
		[getChildrenOfItem, getMoveTargets, registerTreeItem],
	);

	useEffect(() => {
		invariant(ref.current);
		return combine(
			monitorForElements({
				canMonitor: ({ source }) => source.data.uniqueContextId === context.uniqueContextId,
				onDrop(args) {
					const { location, source } = args;
					// didn't drop on anything
					if (!location.current.dropTargets.length) {
						return;
					}

					if (source.data.type === 'tree-item') {
						const itemId = source.data.id;

						const target = location.current.dropTargets[0];
						const targetId = target.data.id;

						const instruction = extractInstruction(target.data);

						if (instruction !== null) {
							updateState({
								type: 'instruction',
								instruction,
								// @ts-ignore
								itemId,	targetId,
							});
						}
					}
				},
			}),
		);
	}, [context, extractInstruction]);

	return (
		<TreeContext.Provider value={context}>
			{/* eslint-disable-next-line @atlaskit/ui-styling-standard/enforce-style-prop -- Ignored via go/DSP-18766 */}
			<div style={{ display: 'flex', justifyContent: 'center', padding: 24 }}>
				
				<div style={{
					display: 'flex',
					boxSizing: 'border-box',
					width: 280,
					padding: 8,
					flexDirection: 'column',
					background: token('elevation.surface.sunken', '#F7F8F9'),
				}} id="tree" ref={ref}>
					{data.map((item, index, array) => {
						const type = (() => {
							if (item.children.length && item.isOpen) {
								return 'expanded';
							}

							if (index === array.length - 1) {
								return 'last-in-group';
							}

							return 'standard';
						})();

						return <TreeItem item={item} level={0} key={item.id} mode={type} index={index} />;
					})}
				</div>
			</div>
		</TreeContext.Provider>
	);
}