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
      ...item,
      tree: () => map,
      isLeft: () => item.left
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
    addChildrensMethod(item);
    delete item.left;
  });
  return map;
}
function pack(tree) {
  return Object.values(tree)
    .map((item) => ({ ...item }))
    .map((item) => {
      item.left = item.isLeft();
      delete item.isLeft;
      delete item.tree;
      delete item.right;
      delete item.children;
      return item;
    });
}

function addChildrensMethod(node) {
  node.children = function () {
    return [this.left, this.right].filter(Boolean);
  }.bind(node);
  return node;
}
function clone(tree) {
  return Object.values(tree)
    .map((e) => addChildrensMethod({ ...e }))
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
    id,
    tree: () => updatedTree,
    isLeft: () => left
  };
  if (child) {
    newNode[side] = child;
  }
  newNode.parent = parent;
  addChildrensMethod(newNode);
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
  const node = tree[id];
  if (!node) {
    throw new Error('Node not found!!!');
  }
  const parentNode = tree[node.parent];
  if (!parentNode) {
    throw new Error('Can not remove root!!!');
  }
  const childToKeep = (keepLeft ? node.left : node.right) ?? null;
  const childToDrop = keepLeft ? node.right : node.left;

  if (node.isLeft()) {
    parentNode.left = childToKeep;
  } else {
    parentNode.right = childToKeep;
  }

  const walk = (node) => {
    if (node.left) {
      walk(tree[node.left]);
    }
    if (node.right) {
      walk(tree[node.right]);
    }
  };
  walk(this.map[startFrom]);
}
module.exports = {
  valid,
  load,
  pack,
  addChildrensMethod,
  clone,
  insert,
  insertLeft,
  insertRight
};
