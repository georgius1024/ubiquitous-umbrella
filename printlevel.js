//const root = { "name": 1, "items": [{ "name": 2, items: [{ name: '2.1' }, { name: '2.2' }] }, { "name": 5 }, { "name": 336 }] }
const root = {
  name: 1,
  items: [
    { name: 2, items: [{ name: 3 }, { name: 4 }] },
    { name: 5, items: [{ name: 6 }] }
  ]
};

function printTree(node, last = true, indent = '', root = false) {
  const connection = !root ? (last ? '└' : '├') : '';
  console.log(indent + connection + node.name);
  if (node.items) {
    const continuation = !root ? (last ? ' ' : '│') : '';
    node.items.forEach((item, index) => {
      printTree(item, index === node.items.length - 1, indent + continuation);
    });
  }
}

printTree(root, true, '', true);
