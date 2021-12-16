//const root = { "name": 1, "items": [{ "name": 2, "items": [{ "name": 3 }, { "name": 4 }] }, { "name": 5, "items": [{ "name": 6 }] }] }
//const root = { "name": 1, "items": [{ "name": 2, items: [{name: '2.1'}, {name: '2.2'}] }, { "name": 5 }, { "name": 336 }] }
const root = { "name": 1, "items": [{ "name": '1.1' }, { "name": '1.2' }, { "name": '1.3' }] }

function print(node, parents=[]) {
  //console.log(node, parents)
  const indent = parents.map((parent, index) => {
    console.log(parent, index)
    if (index === parent.items.length - 1) {
      return '└'
    }
    if (index=== 0) {
      return '├'
    }
  }).join('')
  console.log(indent + node.name)
  node.items && node.items.forEach((item, index) => print(
    item, 
    parents.concat([node])
  ))
}


/*
const levelOffs = 2
const padChar = '•'
function print(node, level = 0, indent = '', first = true, last = false) {
  if (level > 0) {
    //if (first) {
    //  indent = indent + '┌'
    //} else 
    if (last) {
      indent = indent + '└'
    } else {
      indent = indent + '├'
    }

    //indent = indent + (last ? '└': '├')
  }
  
  console.log(indent + node.name, first, last)
  //console.log(padChar.repeat(level * levelOffs),  node.name, last)
  node.items && node.items.forEach((item, index) => print(
    item, 
    level + 1, 
    indent,
    index === 0,
    index === node.items.length-1)
  )
}
*/
print(root)