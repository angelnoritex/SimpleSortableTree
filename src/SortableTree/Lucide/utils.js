/**
 * @typedef {Object} TreeNodeItem
 * @property {string} _id
 * @property {string} label
 * @property {TreeNodeItem[]} [children]
 */

/**
 * Finds a node and its parent array by _ID
 * @param {TreeNodeItem[]} nodes
 * @param {string} _id
 * @returns {[TreeNodeItem | null, TreeNodeItem[] | null]}
 */
export function findNodeById(nodes, _id) {
  for (const node of nodes) {
    if (node._id === _id) return [node, nodes];
    if (node.children) {
      const [found, parent] = findNodeById(node.children, _id);
      if (found) return [found, parent];
    }
  }
  return [null, null];
}

/**
 * Removes a node from the tree by _ID
 * @param {TreeNodeItem[]} nodes
 * @param {string} _id
 * @returns {TreeNodeItem[]}
 */
export function removeNode(nodes, _id) {
  
  return nodes.filter((node) => {
    if (node._id === _id) return false;
    {/** */}
    if (node.children) {
      node.children = removeNode(node.children, _id);
    }
    return true;
  });
}

/**
 * Adds a child node to a parent node
 * @param {TreeNodeItem[]} nodes
 * @param {string} parentId
 * @param {TreeNodeItem} newNode
 * @returns {TreeNodeItem[]}
 */
export function addChildToNode(nodes, parentId, newNode) {
  return nodes.map((node) => {
    if (node._id === parentId) {
      return {
        ...node,
        children: [...(node.children || []), newNode],
      };
    }
    if (node.children) {
      return {
        ...node,
        children: addChildToNode(node.children, parentId, newNode),
      };
    }
    return node;
  });
}