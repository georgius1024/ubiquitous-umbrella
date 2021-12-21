function valid(data) {
  try {
    load(data);
    return true;
  } catch (error) {
    return error.message;
  }
}
function load(data) {
  const roots = data.filter((e) => !e.parent);
  if (!roots.length) {
    throw new Error('Root node is required');
  }
  if (roots.length > 1) {
    throw new Error('Only one root node allowed');
  }
  if (data.find((e) => !e.id)) {
    throw new Error('"id" field is required for all nodes');
  }
  const map = data
    .map((item) => ({ ...item }))

    .reduce((map, item) => ({ ...map, [item.id]: item }), {});
  Object.values(map).forEach((item) => {
    const parentNode = map[item.parent];
    if (parentNode) {
      if (item.left) {
        parentNode.left = item.id;
      } else {
        parentNode.right = item.id;
      }
      if (parentNode.right && !parentNode.fork) {
        throw new Error('"right" children allowed only for fork nodes');
      }
    }
    delete item.left;
  });
  return map;
}
function pack(tree) {
  return Object.values(tree)
    .map((item) => ({ ...item }))
    .map((item) => {
      const parent = tree[item.parent];
      item.isLeft = (parent && parent.left === item.id) ?? null;
      return item;
    })
    .map((item) => {
      item.left = item.isLeft;
      delete item.isLeft;
      delete item.right;
      return item;
    });
}
function clone(tree) {
  return Object.values(tree)
    .map((e) => ({ ...e }))
    .reduce((map, item) => ({ ...map, [item.id]: item }), {});
}
function insert(tree, parent, id, left = null, payload = {}) {
  const updatedTree = clone(tree);
  const parentNode = updatedTree[parent];
  if (!parentNode) {
    throw new Error('Parent node not found');
  }
  if (parentNode.fork) {
    if (left === null) {
      if (!parentNode.left) {
        left = true; // left is free - drop to left
      } else if (!parentNode.right) {
        left = false; // right is free - drop to right
      } else {
        throw new Error("Can't insert to this target");
      }
    }
  } else {
    left = left ?? true;
    if (left === false) {
      throw new Error('Parent node can\t accept "right" children');
    }
  }

  const side = left ? 'left' : 'right';
  const child = parentNode[side];

  parentNode[side] = id;

  const newNode = {
    ...payload,
    id
  };
  if (child) {
    newNode.left = child; // <== start from leftmost
    const childNode = updatedTree[child];
    childNode.parent = id;
  }
  newNode.parent = parent;
  updatedTree[id] = newNode;
  return updatedTree;
}
function insertLeft(tree, parent, id, payload = {}) {
  return insert(tree, parent, id, true, payload);
}
function insertRight(tree, parent, id, payload = {}) {
  return insert(tree, parent, id, false, payload);
}
function removeNode(tree, id, keepLeft = null) {
  const updatedTree = clone(tree);

  const node = updatedTree[id];
  if (!node) {
    throw new Error('Node not found');
  }
  const parentNode = updatedTree[node.parent];
  if (!parentNode) {
    throw new Error('Can not remove root');
  }
  if (node.fork && node.right && !node.left) {
    keepLeft = keepLeft ?? false; // Because no left child, just right
  } else {
    keepLeft = keepLeft ?? true; // all other cases
  }
  const childToKeep = (keepLeft ? node.left : node.right) ?? null;
  const childToDrop = keepLeft ? node.right : node.left;

  if (node.id === parentNode.left) {
    if (childToKeep) {
      parentNode.left = childToKeep;
    } else {
      delete parentNode.left;
    }
  } else {
    if (childToKeep) {
      parentNode.right = childToKeep;
    } else {
      delete parentNode.right;
    }
  }
  if (childToKeep) {
    const childNode = updatedTree[childToKeep];
    childNode.parent = parentNode.id;
  }
  if (childToDrop) {
    const walk = (node) => {
      node.left && walk(updatedTree[node.left]);
      node.right && walk(updatedTree[node.right]);
      delete updatedTree[node.id];
    };
    walk(updatedTree[childToDrop]);
  }
  delete updatedTree[id];
  return updatedTree;
}
function removeSubtree(tree, id) {
  const updatedTree = clone(tree);

  const node = updatedTree[id];
  if (!node) {
    throw new Error('Node not found');
  }
  const parentNode = updatedTree[node.parent];
  if (!parentNode) {
    throw new Error('Can not remove root');
  }
  if (node.id === parentNode.left) {
    delete parentNode.left;
  } else {
    delete parentNode.right;
  }
  const walk = (node) => {
    node.left && walk(updatedTree[node.left]);
    node.right && walk(updatedTree[node.right]);
    delete updatedTree[node.id];
  };
  walk(node);
  return updatedTree;
}
function payload(node) {
  const { id, parent, left, right, ...rest } = node; // fork attribute goes with the rest
  return rest;
}
function swapChildren(tree, node) {
  const updatedTree = clone(tree);

  const parentNode = updatedTree[node];
  if (!parentNode) {
    throw new Error('Node not found');
  }
  if (!parentNode.fork) {
    throw new Error('Can not swap children of non-fork node');
  }
  const { left, right } = parentNode;
  parentNode.left = right;
  parentNode.right = left;
  if (!parentNode.left) {
    delete parentNode.left;
  }
  if (!parentNode.right) {
    delete parentNode.right;
  }
  return updatedTree;
}
function moveNode(tree, target, source, left = null) {
  const targetNode = tree[target];
  if (!targetNode) {
    throw new Error('Target node not found');
  }
  const sourceNode = tree[source];
  if (!sourceNode) {
    throw new Error('Source node not found');
  }
  if (!sourceNode.parent) {
    throw new Error("Can't move root");
  }
  if (sourceNode.fork) {
    throw new Error("Can't move subtree");
  }
  if (sourceNode.parent === targetNode.id) {
    if (targetNode.fork) {
      return swapChildren(tree, targetNode.id);
    } else {
      return moveNode(tree, source, target, left);
    }
  }
  const updated = removeNode(tree, source); // <== preserve auto
  return insert(
    updated,
    targetNode.id,
    sourceNode.id,
    left,
    payload(sourceNode)
  );
}
function hasAsParent(tree, node, candidate) {
  const walk = (node) => {
    if (node.id === candidate) {
      return true;
    } else if (node.parent) {
      return walk(tree[node.parent]);
    } else {
      return false;
    }
  };
  return walk(tree[node]);
}
function moveSubtree(tree, target, source, left = null) {
  const updatedTree = clone(tree);
  const targetNode = updatedTree[target];
  if (!targetNode) {
    throw new Error('Target node not found');
  }
  if (!targetNode.parent) {
    throw new Error("Can't move root");
  }
  if (targetNode.fork) {
    if (left === null) {
      if (!targetNode.left) {
        left = true; // left is free - drop to left
      } else if (!targetNode.right) {
        left = false; // right is free - drop to right
      } else {
        throw new Error("Can't move to this target");
      }
    }
  } else {
    left = left ?? true;
    if (left === false) {
      throw new Error('Target node can\'t accept "right" children');
    }
  }
  if ((targetNode.left && left) || (targetNode.right && !left)) {
    throw new Error("Target node can't accept children on this side");
  }
  const sourceNode = updatedTree[source];
  if (!sourceNode) {
    throw new Error('Source node not found');
  }
  if (hasAsParent(tree, targetNode.id, sourceNode.id)) {
    throw new Error("Can not move node to it's children");
  }
  // update old parent, remove link to source node
  const oldParentNode = updatedTree[sourceNode.parent];
  if (oldParentNode.left === sourceNode.id) {
    delete oldParentNode.left;
  }
  if (oldParentNode.right === sourceNode.id) {
    delete oldParentNode.right;
  }
  // update target, add link to source node
  if (left) {
    targetNode.left = sourceNode.id;
  } else {
    targetNode.right = sourceNode.id;
  }
  // update source node set new parent
  sourceNode.parent = target;
  return updatedTree;
}

export default {
  valid,
  load,
  pack,
  clone,
  insert,
  insertLeft,
  insertRight,
  payload,
  removeNode,
  removeSubtree,
  hasAsParent,
  swapChildren,
  moveNode,
  moveSubtree
};
