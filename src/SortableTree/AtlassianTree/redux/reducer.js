import tree from './actions';

/**
 * Toggles the expanded state of an item.
 * @param {TreeItem} item - The item to toggle.
 * @returns {TreeItem} The updated item.
 */
function toggle(item, itemId) {
    if (!tree.hasChildren(item)) {
        return item;
    }

    if (item.id === itemId) {
        return { ...item, expanded: !item.expanded };
    }

    return { ...item, children: item.children.map(child => toggle(child, itemId)) };
}

/**
 * Handles reparenting of an item.
 * @param {TreeItem[]} data - The current tree data.
 * @param {TreeAction} action - The action to perform.
 * @param {TreeItem} item - The item to reparent.
 * @returns {TreeItem[]} The updated tree data.
 */
function handleReparent(data, action, item) {
    const path = tree.getPathToItem({
        current: data,
        targetId: action.targetId,
    });
    invariant(path);
    const desiredId = path[action.instruction.desiredLevel];
    let result = tree.remove(data, action.itemId);
    return tree.insertAfter(result, desiredId, item);
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


/**
 * Reducer function for the tree data.
 * @param {TreeItem[]} data - The current tree data.
 * @param {TreeAction} action - The action to perform.
 * @returns {TreeItem[]} The updated tree data.
 */
const dataReducer = (data, action) => {

    const item = tree.find(data, action.itemId);
    if (!item) {
        return data;
    }

    let result;
   
    
    switch (action.type) {

        case 'paste':
            return tree.insertAtLast(data, action.item);

        case 'hide':
            return tree.hide(data, action.itemId);

        case 'update':
            return tree.update(data, action.item);

        case 'insertAtLast':
            return tree.insertAtLast(data, action.item);

        case 'instruction':
            const { instruction } = action;
            if (instruction.type === 'reparent') {
                return handleReparent(data, action, item);
            }

            if (action.itemId === action.targetId) {
                return data;
            }

            result = tree.remove(data, action.itemId);
            switch (instruction.type) {
                case 'reorder-above':
                    return tree.insertBefore(result, action.targetId, item);
                case 'reorder-below':
                    return tree.insertAfter(result, action.targetId, item);
                case 'make-child':
                    return tree.insertChild(result, action.targetId, item);
                default:
                    console.warn('TODO: action not implemented', instruction);
                    return data;
            }

        case 'toggle':
            return data.map(child => toggle(child, action.itemId));

        case 'expand':
            if (tree.hasChildren(item) && !item.expanded) {
                return data.map(child => toggle(child, action.itemId));
            }
            return data;

        case 'collapse':
            if (tree.hasChildren(item) && item.expanded) {
                return data.map(child => toggle(child, action.itemId));
            }
            return data;

        case 'remove':
            return tree.remove(data, item.id);

        case 'copy':
           
            return tree.copy(data, action.itemId, item);

        case 'modal-move':
            result = tree.remove(data, item.id);
            const siblingItems = getChildItems(result, action.targetId);

            if (siblingItems.length === 0) {
                if (action.targetId === '') {
                    return [item];
                } else {
                    return tree.insertChild(result, action.targetId, item);
                }
            } else if (action.index === siblingItems.length) {
                const relativeTo = siblingItems[siblingItems.length - 1];
                return tree.insertAfter(result, relativeTo.id, item);
            } else {
                const relativeTo = siblingItems[action.index];
                return tree.insertBefore(result, relativeTo.id, item);
            }

        default:
            return data;
    }
};

export default dataReducer;
