// @ts-check

import React, { useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { triggerPostMoveFlash } from '@atlaskit/pragmatic-drag-and-drop-flourish/trigger-post-move-flash';
import * as liveRegion from '@atlaskit/pragmatic-drag-and-drop-live-region';
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';

import tree from './redux/actions';
import { DependencyContext, TreeContext } from './tree-context';
import TreeItem from './TreeItemComponent';

// @ts-ignore
import './styles.css';

/**
 * @typedef {import("./types").TreeContextValue} TreeContextValue
 * @typedef {import("./types").TreeItem} TreeItemType
 */


/**
 * @typedef {function({ itemId: string, element: HTMLElement, actionMenuTrigger: HTMLElement }): ()=>void} RegisterTreeItem
 * @returns {{ registry: Map<string, { element: HTMLElement, actionMenuTrigger: HTMLElement }>, registerTreeItem:RegisterTreeItem }}
 */
function useTreeRegistry() {
	const [registry] = useState(() => new Map());
	
	const registerTreeItem = useCallback(({ itemId, element, actionMenuTrigger }) => {
		registry.set(itemId, { element, actionMenuTrigger });
		return () => registry.delete(itemId);
	}, []);

	return { registry, registerTreeItem };
}






export default function AtlassianTree({state, updateState}) {
	const ref = useRef(null);
	// @ts-ignore
	const { extractInstruction } = useContext(DependencyContext);
	const { registry, registerTreeItem } = useTreeRegistry();

	const { data, lastAction } = state;

	const lastStateRef = useRef(data);

	useEffect(() => {
		lastStateRef.current = data;
	}, [data]);

	useEffect(() => {
		if (!lastAction) return;

		const item = registry.get(lastAction.itemId);
		if (!item?.element) return;

		if (lastAction.type === 'modal-move') {
			const parentName = lastAction.targetId || 'the root';
			liveRegion.announce(
				`You've moved Item ${lastAction.itemId} to position ${lastAction.index + 1} in ${parentName}.`
			);
			triggerPostMoveFlash(item.element);
			item.actionMenuTrigger?.focus();
		} else if (lastAction.type === 'instruction') {
			triggerPostMoveFlash(item.element);
		}
	}, [lastAction, registry]);

	/**
	 * @param {object} param
	 * @param {string } param.itemId - The item ID.
	 * @returns {TreeItemType[]} The list of move targets.
	 */
	const getMoveTargets = useCallback(({ itemId }) => {
		const data = lastStateRef.current;
		return data.reduce((/** @type {any[]} */ targets, /** @type {{ id: any; children: any; }} */ node) => {
			if (node.id !== itemId) {
				targets.push(node);
				targets.push(...node.children);
			}
			return targets;
		}, []);
	}, []);

	/**
	 * Gets the children of the item with the given ID.
	 * @param {string} itemId - The item ID.
	 * @returns {TreeItemType[]} The children of the item.
	 */
	const getChildrenOfItem = useCallback((/** @type {string} */ itemId) => {
		const data = lastStateRef.current;
		return itemId === '' ? data : tree.find(data, itemId)?.children || [];
	}, []);

	const context = useMemo(() => ({
		dispatch: updateState,
		uniqueContextId: Symbol('unique-id'),
		getPathToItem: (/** @type {any} */ targetId) => tree.getPathToItem({ current: lastStateRef.current, targetId }) || [],
		getMoveTargets,
		getChildrenOfItem,
		registerTreeItem,
	}), [getMoveTargets, getChildrenOfItem, registerTreeItem]);

	useEffect(() => {
		if (!ref.current) return;
		
		return combine(
			monitorForElements({
				canMonitor: ({ source }) => source.data.uniqueContextId === context.uniqueContextId,
				onDrop({ location, source }) {
					if (!location.current.dropTargets.length || source.data.type !== 'tree-item') return;

					const instruction = extractInstruction(location.current.dropTargets[0].data);
					if (instruction) {
						updateState({
							type: 'instruction',
							instruction,
							itemId: source.data.id,
							targetId: location.current.dropTargets[0].data.id,
						});
					}
				},
			})
		);
	}, [context, extractInstruction]);

	return (
		<TreeContext.Provider value={context}>
			<div className={'wrapper'}>
				<div className={'treeContainer'} ref={ref}>
					{
					
					data.map((
						/** @type {TreeItemType} */ item,
						/** @type {number} */ index, 
						/** @type {string | any[]} */ array) => (
						<TreeItem
							key={item.id}
							item={item}
							level={0}
							mode={item.children?.length && item.expanded ? 'expanded' : 
									index === array.length - 1 ? 'last-in-group' : 'standard'}
							index={index}
						/>
					))}
				</div>
			</div>
		</TreeContext.Provider>
	);
}