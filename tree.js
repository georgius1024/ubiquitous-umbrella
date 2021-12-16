function valid(data) {
  return (
    Array.isArray(data) &&
    data.length &&
    data.every((item) => 'id' in item && 'parent' in item && 'left' in item)
  );
}
function load(data) {
  const map = data
    .map((item) => ({ ...item }))
    .map((item) => ({
      ...item
    }))
    .reduce((map, item) => ({ ...map, [item.id]: item }), {});
  Object.values(map).forEach((item) => {
    const parent = map[item.parent];
    if (parent) {
      if (item.left) {
        parent.left = item.id;
      } else {
        parent.right = item.id;
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
function insert(tree, parent, id, left, payload = {}) {
  const updatedTree = clone(tree);
  const parentNode = updatedTree[parent];
  if (!parentNode) {
    throw new Error('Parent node not found!!!');
  }
  const side = left ? 'left' : 'right';
  const child = parentNode[side];

  parentNode[side] = id;

  const newNode = {
    ...payload,
    id
  };
  if (child) {
    newNode[side] = child;
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

function remove(tree, id, keepLeft = true) {
  const updatedTree = clone(tree);

  const node = updatedTree[id];
  if (!node) {
    throw new Error('Node not found!!!');
  }
  const parentNode = updatedTree[node.parent];
  if (!parentNode) {
    throw new Error('Can not remove root!!!');
  }
  const childToKeep = (keepLeft ? node.left : node.right) ?? null;
  const childToDrop = keepLeft ? node.right : node.left;

  if (node.id === parentNode.left) {
    parentNode.left = childToKeep;
  } else {
    parentNode.right = childToKeep;
  }
  if (childToKeep) {
    const childNode = updatedTree[childToKeep];
    childNode.parent = parentNode.id;
  }
  if (childToDrop) {
    const walk = (node) => {
      if (node.left) {
        walk(updatedTree[node.left]);
      }
      if (node.right) {
        walk(updatedTree[node.right]);
      }
      delete updatedTree[node.id];
    };
    walk(updatedTree[childToDrop]);
  }
  delete updatedTree[id];
  return updatedTree;
}
module.exports = {
  valid,
  load,
  pack,
  clone,
  insert,
  insertLeft,
  insertRight,
  remove
};
