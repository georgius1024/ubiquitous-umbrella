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

module.exports = {
  valid,
  load,
  pack
};
