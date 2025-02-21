

const tree = {
	/**
	 * Hides an item in the tree.
	 * @param {TreeItem[]} data - The tree data.
	 * @param {string} id - The ID of the item to hide.
	 * @returns {TreeItem[]} The updated tree data.
	 */


	hide(data, id) {
		return data.map((item) => {
			if (item.id === id) {
				return { ...item, hide: !item.hide };
			}
			if (tree.hasChildren(item)) {
				return { ...item, children: tree.hide(item.children, id) };
			}
			return item;
		});
	},

	/**
	 * Removes an item from the tree.
	 * @param {TreeItem[]} data - The tree data.
	 * @param {string} id - The ID of the item to remove.
	 * @returns {TreeItem[]} The updated tree data.
	 */
	remove(data, id) {
		return data
			.filter((item) => item.id !== id)
			.map((item) => {
				if (tree.hasChildren(item)) {
					return { ...item, children: tree.remove(item.children, id) };
				}
				return item;
			});
	},

	/**
	 * Inserts a new item before the target item.
	 * @param {TreeItem[]} data - The tree data.
	 * @param {string} targetId - The ID of the target item.
	 * @param {TreeItem} newItem - The new item to insert.
	 * @returns {TreeItem[]} The updated tree data.
	 */
	insertBefore(data, targetId, newItem) {
		return data.flatMap((item) => {
			if (item.id === targetId) {
				return [newItem, item];
			}
			if (tree.hasChildren(item)) {
				return { ...item, children: tree.insertBefore(item.children, targetId, newItem) };
			}
			return item;
		});
	},

	/**
	 * Inserts a new item at the end of the tree.
	 * @param {TreeItem[]} data - The tree data.
	 * @param {TreeItem} newItem - The new item to insert.
	 * @returns {TreeItem[]} The updated tree data.
	 */
	insertAtLast(data, newItem) {
		newItem.id = data.length + 2;
		return [...data, newItem];
	},

	/**
	 * Copies an item and inserts it after the target item.
	 * @param {TreeItem[]} data - The tree data.
	 * @param {string} targetId - The ID of the target item.
	 * @param {TreeItem} newItem - The new item to copy.
	 * @returns {TreeItem[]} The updated tree data.
	 */
	/**
	 * Copies an item and inserts it after the target item.
	 * @param {TreeItem[]} data - The tree data.
	 * @param {string} targetId - The ID of the target item.
	 * @param {TreeItem} newItem - The new item to copy.
	 * @returns {TreeItem[]} The updated tree data.
	 */
	copy(data, targetId, newItem) {

		return data.flatMap((item) => {
			if (item.id === targetId) {
				item.copys = (item.copys || 0) + 1;

				const assignNewIds = (item, parentId, key) => {
					const newId = key ? `${item.id}${key}` : `${parentId}${item.id}`;
					return {
						...item,
						id: newId,
						children: tree.hasChildren(item) ? item.children.flatMap((child, key) => assignNewIds(child, newId, key)) : []
					};
				};

				const newCopy = assignNewIds(newItem, `${newItem.id}-${item.copys}`);

				localStorage.setItem('saved_menu', JSON.stringify(newCopy));

				return [item, newCopy];
			}
			if (tree.hasChildren(item)) {
				return {
					...item,
					children: tree.copy(item.children, targetId, newItem),
				};
			}

			return item;
		});
	},


	/**
	 * Updates an item in the tree.
	 * @param {TreeItem[]} data - The tree data.
	 * @param {TreeItem} newItem - The new item to update.
	 * @returns {TreeItem[]} The updated tree data.
	 */
	update(data, newItem) {
		return data.map((item) => {
			if (item.id === newItem.id) {
				return newItem;
			}
			if (tree.hasChildren(item)) {
				return { ...item, children: tree.update(item.children, newItem) };
			}
			return item;
		});
	},

	/**
	 * Inserts a new item after the target item.
	 * @param {TreeItem[]} data - The tree data.
	 * @param {string} targetId - The ID of the target item.
	 * @param {TreeItem} newItem - The new item to insert.
	 * @returns {TreeItem[]} The updated tree data.
	 */
	insertAfter(data, targetId, newItem) {
		return data.flatMap((item) => {
			if (item.id === targetId) {
				return [item, newItem];
			}
			if (tree.hasChildren(item)) {
				return { ...item, children: tree.insertAfter(item.children, targetId, newItem) };
			}
			return item;
		});
	},

	/**
	 * Inserts a new item as a child of the target item.
	 * @param {TreeItem[]} data - The tree data.
	 * @param {string} targetId - The ID of the target item.
	 * @param {TreeItem} newItem - The new item to insert.
	 * @returns {TreeItem[]} The updated tree data.
	 */
	insertChild(data, targetId, newItem) {
		return data.map((item) => {
			if (item.id === targetId) {
				return { ...item, expanded: true, children: [newItem, ...item.children] };
			}
			if (tree.hasChildren(item)) {
				return { ...item, children: tree.insertChild(item.children, targetId, newItem) };
			}
			return item;
		});
	},

	/**
	 * Finds an item in the tree by its ID.
	 * @param {TreeItem[]} data - The tree data.
	 * @param {string} itemId - The ID of the item to find.
	 * @returns {TreeItem|undefined} The found item, or undefined if not found.
	 */
	find(data, itemId) {
		for (const item of data) {
			if (item.id === itemId) {
				return item;
			}
			if (tree.hasChildren(item)) {
				const result = tree.find(item.children, itemId);
				if (result) {
					return result;
				}
			}
		}
	},

	/**
	 * Gets the path to an item in the tree.
	 * @param {Object} params - The parameters.
	 * @param {TreeItem[]} params.current - The current tree data.
	 * @param {string} params.targetId - The ID of the target item.
	 * @param {string[]} [params.parentIds=[]] - The parent IDs.
	 * @returns {string[]|undefined} The path to the item, or undefined if not found.
	 */
	getPathToItem({ current, targetId, parentIds = [] }) {
		for (const item of current) {
			if (item.id === targetId) {
				return parentIds;
			}
			const nested = tree.getPathToItem({
				current: item.children,
				targetId,
				parentIds: [...parentIds, item.id],
			});
			if (nested) {
				return nested;
			}
		}
	},

	/**
	 * Checks if an item has children.
	 * @param {TreeItem} item - The item to check.
	 * @returns {boolean} True if the item has children, false otherwise.
	 */
	hasChildren(item) {
		return item.children && item.children.length > 0;
	},
};

export default tree;
