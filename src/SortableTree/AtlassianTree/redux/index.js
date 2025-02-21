// @ts-check
import invariant from 'tiny-invariant';
import tree from './actions';
import  dataReducer  from './reducer';
//import type {TreeAction, TreeState, TreeItem} from './types'

/**
 * @typedef {import("../types").TreeAction} TreeAction
 * @typedef {import("../types").TreeItem} TreeItem
 * @typedef {import("../types").TreeState} TreeState
 */

/**
 * 
 * @param {TreeItem[]} Arr 
 * @param {string|Number} [parentId]
 */
export const createNodeKey = (Arr, parentId) => {
	Arr.map((e, key) => {
		e.id = `${parentId ? `${parentId}_${key}` : key}`
		if (e.children) createNodeKey(e.children, `${parentId ? `${parentId}_${key}` : key}`)
	})
}



/**
 * Reducer function for the tree state.
 * @param {TreeState} state - The current state.
 * @param {TreeAction} action - The action to perform.
 * @returns {TreeState} The updated state.
 */
export function treeStateReducer(state, action) {
	return {
		data: dataReducer(state.data, action),
		lastAction: action,
	};
}



/**
 * Gets the child items of a target item.
 * @param {TreeItem[]} data - The tree data.
 * @param {string} targetId - The ID of the target item.
 * @returns {TreeItem[]} The child items of the target item.
 */
function getChildItems(data, targetId) {
	/**
	 * An empty string is representing the root
	 */
	if (targetId === '') {
		return data;
	}

	const targetItem = tree.find(data, targetId);
	invariant(targetItem);

	return targetItem.children;
}
