import tree from './tree';
describe('tree', () => {
  const testData = [
    { id: 100, parent: null, left: null, fork: true },
    { id: 101, parent: 100, left: true, fork: true },
    { id: 102, parent: 100, left: false, fork: true },
    { id: 103, parent: 101, left: true },
    { id: 104, parent: 101, left: false },
    { id: 105, parent: 102, left: false },
    { id: 106, parent: 105, left: true },
    { id: 107, parent: 106, left: true }
  ];
  /*
          <100>
          /    \
      <101>    <102>
      /   \        \
   (103) (104)    (105)
                    |
                  (106)
                    |
                  (107)
   */

  it('imports without errors', () => {
    expect(tree).toBeDefined();
    expect(tree).toHaveProperty('valid');
  });
  describe('validate', () => {
    it('returns true when data is valid', () => {
      expect(tree.valid([{ id: 100 }])).toBe(true);
      expect(
        tree.valid([
          { id: 100, fork: true },
          { id: 101, parent: 100, left: false },
          { id: 102, parent: 100, left: true }
        ])
      ).toBeTrue();
    });
    it('returns string when data is not valid', () => {
      expect(tree.valid([{ id: 100 }, {}])).toBeString();
      expect(tree.valid([{ id: 100 }, { id: 101 }])).toBeString();
      expect(tree.valid([{ id: 100, parent: 100 }])).toBeString();
      expect(tree.valid([])).toBeString();
      expect(tree.valid([{ left: true }])).toBeString();
      expect(
        tree.valid([{ id: 100 }, { id: 101, parent: 100, left: false }])
      ).toBeString();
    });
  });
  describe('load', () => {
    it('throws on incorrect data', () => {
      expect(() => tree.load([{ id: 100 }, {}])).toThrow();
      expect(() => tree.load([{ id: 100 }, { id: 101 }])).toThrow();
      expect(() => tree.load([{ id: 100, parent: 100 }])).toThrow();
      expect(() => tree.load([])).toThrow();
      expect(() => tree.load([{ left: true }])).toThrow();
      expect(() =>
        tree.load([{ id: 100 }, { id: 101, parent: 100, left: false }])
      ).toThrow();
    });
    it('returns tree object', () => {
      const result = tree.load(testData);
      expect(result).toHaveProperty('100.left', 101);
      expect(result).toHaveProperty('100.right', 102);
      expect(result).toHaveProperty('101.left', 103);
      expect(result).toHaveProperty('101.right', 104);
      expect(result).toHaveProperty('102.right', 105);
      expect(result).toHaveProperty('105.parent', 102);
    });
  });
  describe('pack', () => {
    it('returns initial object', () => {
      const result = tree.pack(tree.load(testData));
      expect(result).toEqual(testData);
    });
  });
  describe('clone', () => {
    it('returns exact copy', () => {
      const instance = tree.load(testData);
      const copy = tree.clone(instance);
      expect(copy).toEqual(instance);
    });
    it('contains different objects', () => {
      const instance = tree.load(testData);
      const copy = tree.clone(instance);
      expect(copy['101']).toEqual(instance['101']);
      expect(copy['101']).not.toBe(instance['101']);
    });
  });
  describe('insert', () => {
    it('throws error when parent is not in tree', () => {
      const instance = tree.load(testData);
      expect(() => {
        tree.insert(instance, -105, 108);
      }).toThrow();
    });
    it('throws error when parent can not accept right node', () => {
      const instance = tree.load(testData);
      expect(() => {
        tree.insert(instance, 105, 108, false);
      }).toThrow();
      expect(() => {
        tree.insert(instance, 105, 108, true);
      }).not.toThrow();
      expect(() => {
        tree.insert(instance, 101, 108);
      }).toThrow();
    });

    it('not throws error when parent is in tree', () => {
      const instance = tree.load(testData);
      expect(() => {
        tree.insert(instance, 101, 108, true);
      }).not.toThrow();
    });
    it('adds node on leaf node', () => {
      const instance = tree.load(testData);
      const updated = tree.insert(instance, 107, 108, true);
      expect(updated['107']).toHaveProperty('parent', 106);
      expect(updated['107']).toHaveProperty('left', 108);
      expect(updated['107']).not.toHaveProperty('right');
    });
    it('adds nodes on leaf fork node with default placement', () => {
      const instance = tree.load(testData);
      instance['107'].fork = true;
      const updated = tree.insert(tree.insert(instance, 107, 108), 107, 109);
      /*
        <107>
         / \
      (108) (109)
      */
      expect(updated['107']).toHaveProperty('parent', 106);
      expect(updated['107']).toHaveProperty('left', 108);
      expect(updated['107']).toHaveProperty('right', 109);
      expect(updated['108']).toHaveProperty('parent', 107);
      expect(updated['109']).toHaveProperty('parent', 107);
    });
    it('adds nodes on leaf fork node with direct placement', () => {
      const instance = tree.load(testData);
      instance['107'].fork = true;
      const updated = tree.insert(
        tree.insert(instance, 107, 108, false),
        107,
        109,
        true
      );
      /*
        <107>
         / \
      (109) (108)
      */
      expect(updated['107']).toHaveProperty('parent', 106);
      expect(updated['107']).toHaveProperty('left', 109);
      expect(updated['107']).toHaveProperty('right', 108);
      expect(updated['108']).toHaveProperty('parent', 107);
      expect(updated['109']).toHaveProperty('parent', 107);
    });
    it('adds nodes on non-leaf fork node with default placement', () => {
      const instance = tree.load(testData);
      instance['107'].fork = true;
      const updated = tree.insert(tree.insert(instance, 107, 108), 107, 109);
      /*
        <107>
         / \
      (108) (109)
      */
      expect(updated['107']).toHaveProperty('parent', 106);
      expect(updated['107']).toHaveProperty('left', 108);
      expect(updated['107']).toHaveProperty('right', 109);
      expect(updated['109']).toHaveProperty('parent', 107);
      expect(updated['109']).not.toHaveProperty('left');
      expect(updated['109']).not.toHaveProperty('right');
      expect(updated['108']).toHaveProperty('parent', 107);
      expect(updated['108']).not.toHaveProperty('left');
      expect(updated['108']).not.toHaveProperty('right');
    });
    it('adds nodes on non-leaf fork node with direct placement', () => {
      const instance = tree.load(testData);
      const updated = tree.insert(
        tree.insert(instance, 101, 108, false),
        101,
        109,
        true
      );
      /*
        <101>
         / \
      (109) (108)
        |     |
      (103) (104)
      */
      expect(updated['101']).toHaveProperty('parent', 100);
      expect(updated['101']).toHaveProperty('left', 109);
      expect(updated['101']).toHaveProperty('right', 108);
      expect(updated['109']).toHaveProperty('parent', 101);
      expect(updated['109']).toHaveProperty('left', 103);
      expect(updated['109']).not.toHaveProperty('right');
      expect(updated['103']).toHaveProperty('parent', 109);
      expect(updated['103']).not.toHaveProperty('left');
      expect(updated['103']).not.toHaveProperty('right');
      expect(updated['108']).toHaveProperty('parent', 101);
      expect(updated['108']).toHaveProperty('left', 104);
      expect(updated['108']).not.toHaveProperty('right');
      expect(updated['104']).toHaveProperty('parent', 108);
      expect(updated['104']).not.toHaveProperty('left');
      expect(updated['104']).not.toHaveProperty('right');
    });
    it('replaces old child node', () => {
      const instance = tree.load(testData);
      const updated = tree.insert(instance, 105, 108);
      /*
       ...
      (105)
        |
      (108)
        |
      (106)
       ...  
      */
      expect(updated['105']).toHaveProperty('parent', 102);
      expect(updated['105']).toHaveProperty('left', 108);
      expect(updated['105']).not.toHaveProperty('right');
      expect(updated['108']).toHaveProperty('parent', 105);
      expect(updated['108']).toHaveProperty('left', 106);
      expect(updated['108']).toHaveProperty('parent', 105);
      expect(updated['106']).toHaveProperty('parent', 108);
    });
  });
  describe('insert left & right', () => {
    it('both functions are working', () => {
      const instance = tree.load(testData);
      const updated = tree.insertRight(
        tree.insertLeft(instance, 101, 108),
        101,
        109
      );
      expect(updated['101']).toHaveProperty('left', 108);
      expect(updated['101']).toHaveProperty('right', 109);
    });
  });
  describe('removeNode', () => {
    it('throws error when node not found', () => {
      const instance = tree.load(testData);
      expect(() => {
        tree.removeNode(instance, -1);
      }).toThrow();
    });
    it('throws error when removing root', () => {
      const instance = tree.load(testData);
      expect(() => {
        tree.removeNode(instance, 100);
      }).toThrow();
    });
    it('removes leafs nodes', () => {
      const instance = tree.load(testData);
      const updated = tree.removeNode(instance, 107);
      expect(updated['107']).toBeFalsy();
      expect(updated['106']).not.toHaveProperty('left');
    });
    it('removes parents with 1 child', () => {
      const instance = tree.load(testData);
      const updated = tree.removeNode(instance, 106);
      expect(updated['105']).toBeTruthy();
      expect(updated['106']).toBeFalsy();
      expect(updated['107']).toBeTruthy();
      expect(updated['105']).toHaveProperty('left', 107);
      expect(updated['107']).toHaveProperty('parent', 105);
    });
    it('removes parents with 2 child', () => {
      const instance = tree.load(testData);
      const updated = tree.removeNode(instance, 105);
      expect(updated['105']).toBeFalsy();
      expect(updated['106']).toBeTruthy();
      expect(updated['107']).toBeTruthy();
      expect(updated['102']).toHaveProperty('right', 106);
      expect(updated['106']).toHaveProperty('parent', 102);
    });
    it('removes a branch, keeping left side', () => {
      const instance = tree.load(testData);
      const updated = tree.removeNode(instance, 101, true);
      expect(updated['101']).toBeFalsy();
      expect(updated['103']).toBeTruthy();
      expect(updated['104']).toBeFalsy();
      expect(updated['100']).toHaveProperty('left', 103);
      expect(updated['103']).toHaveProperty('parent', 100);
    });
    it('removes a branch, keeping right side', () => {
      const instance = tree.load(testData);
      const updated = tree.removeNode(instance, 101, false);
      expect(updated['101']).toBeFalsy();
      expect(updated['103']).toBeFalsy();
      expect(updated['104']).toBeTruthy();
      expect(updated['100']).toHaveProperty('left', 104);
      expect(updated['104']).toHaveProperty('parent', 100);
    });
    it('removes a branch, keeping left side by default when left is present', () => {
      const instance = tree.load(testData);
      const updated = tree.removeNode(instance, 101);
      expect(updated['101']).toBeFalsy();
      expect(updated['103']).toBeTruthy();
      expect(updated['104']).toBeFalsy();
      expect(updated['100']).toHaveProperty('left', 103);
      expect(updated['103']).toHaveProperty('parent', 100);
    });
    it('removes a branch, keeping right side by default when left is missing', () => {
      const instance = tree.load(testData);
      const updated = tree.removeNode(instance, 102);
      expect(updated['102']).toBeFalsy();
      expect(updated['105']).toBeTruthy();
      expect(updated['100']).toHaveProperty('right', 105);
      expect(updated['105']).toHaveProperty('parent', 100);
      expect(updated['105']).toHaveProperty('left', 106);
    });
    it('removes a branch, discardind right side when specified', () => {
      const instance = tree.load(testData);
      const updated = tree.removeNode(instance, 102, true);
      expect(updated['102']).toBeFalsy();
      expect(updated['105']).toBeFalsy();
      expect(updated['106']).toBeFalsy();
      expect(updated['100']).not.toHaveProperty('right');
    });
  });
  describe('removeSubtree', () => {
    it('throws error when node not found', () => {
      const instance = tree.load(testData);
      expect(() => {
        tree.removeSubtree(instance, -1);
      }).toThrow();
    });
    it('throws error when removing root', () => {
      const instance = tree.load(testData);
      expect(() => {
        tree.removeSubtree(instance, 100);
      }).toThrow();
    });
    it('removes subtree', () => {
      const instance = tree.load(testData);
      const updated = tree.removeSubtree(instance, 101);
      /*
      <100>
        |
      <102>
        \
       (105)
         |
       (106)
         |
       (107)
      */
      expect(updated['101']).toBeFalsy();
      expect(updated['103']).toBeFalsy();
      expect(updated['104']).toBeFalsy();

      expect(updated['100']).toHaveProperty('parent', null);
      expect(updated['100']).toHaveProperty('right', 102);
      expect(updated['100']).not.toHaveProperty('left');

      expect(updated['102']).toHaveProperty('parent', 100);
      expect(updated['102']).toHaveProperty('right', 105);
      expect(updated['102']).not.toHaveProperty('left');
    });
    it('removes another subtree, right from parent', () => {
      const instance = tree.load(testData);
      const updated = tree.removeSubtree(instance, 102);
      expect(updated['102']).toBeFalsy();
      expect(updated['105']).toBeFalsy();
      expect(updated['106']).toBeFalsy();
      expect(updated['100']).not.toHaveProperty('right');
    });
  });
  describe('payload', () => {
    it('removes id, parent, left, right and keeps attributes', () => {
      const updated = tree.payload({
        id: 1,
        parent: 2,
        left: 3,
        right: 4,
        payload1: 101,
        payload2: 'string'
      });
      expect(updated).toEqual({ payload1: 101, payload2: 'string' });
    });
  });
  describe('swapChildren', () => {
    test('throws on not valid nodes', () => {
      const instance = tree.load(testData);
      expect(() => {
        tree.swapChildren(instance, -105);
      }).toThrow();
      expect(() => {
        tree.swapChildren(instance, 105);
      }).toThrow();
      expect(() => {
        tree.swapChildren(instance, 101);
      }).not.toThrow();
    });

    test('swap left and right children of node', () => {
      const instance = tree.load(testData);
      const updated = tree.swapChildren(instance, 101);
      /*
               <100>
              /    \
          <101>    <102>
          /   \      \
      (104) (103)   (105)
                      |
                    (106)
                      |
                    (107)
      */
      expect(updated['101']).toHaveProperty('parent', 100);
      expect(updated['101']).toHaveProperty('left', 104);
      expect(updated['101']).toHaveProperty('right', 103);

      expect(updated['103']).toHaveProperty('parent', 101);
      expect(updated['103']).not.toHaveProperty('left');
      expect(updated['103']).not.toHaveProperty('right');

      expect(updated['104']).toHaveProperty('parent', 101);
      expect(updated['104']).not.toHaveProperty('left');
      expect(updated['104']).not.toHaveProperty('right');
    });
    test('swap nothing for leaf node', () => {
      const instance = tree.load(testData);
      instance['107'].fork = true;
      const updated = tree.swapChildren(instance, 107);
      expect(updated['107']).not.toHaveProperty('left');
      expect(updated['107']).not.toHaveProperty('right');
    });
  });
  describe('moveNode', () => {
    test('throws on not valid moves', () => {
      const instance = tree.load(testData);
      expect(() => {
        tree.moveNode(instance, -105, 107);
      }).toThrow();
      expect(() => {
        tree.moveNode(instance, 105, -107);
      }).toThrow();
      expect(() => {
        tree.moveNode(instance, 107, 101);
      }).toThrow();
      expect(() => {
        tree.moveNode(instance, 107, 100);
      }).toThrow();
    });
    test('move node 2 levels up', () => {
      const instance = tree.load(testData);
      const updated = tree.moveNode(instance, 105, 107);
      // <102> -> (105) -> (106) -> (107)
      // ==>
      // <102> -> (105) -> (107) -> (106)
      expect(updated['105']).toHaveProperty('parent', 102);
      expect(updated['105']).toHaveProperty('left', 107);
      expect(updated['105']).not.toHaveProperty('right');
      expect(updated['107']).toHaveProperty('parent', 105);
      expect(updated['107']).toHaveProperty('left', 106);
      expect(updated['107']).not.toHaveProperty('right');
      expect(updated['106']).toHaveProperty('parent', 107);
      expect(updated['106']).not.toHaveProperty('left');
      expect(updated['106']).not.toHaveProperty('right');
    });
    test('move node 2 levels down', () => {
      const instance = tree.load(testData);
      const updated = tree.moveNode(instance, 107, 105);
      // <102> -> (105) -> (106) -> (107)
      // ==>
      // <102> -> (106) -> (107) -> (105)
      expect(updated['106']).toHaveProperty('parent', 102);
      expect(updated['106']).toHaveProperty('left', 107);
      expect(updated['106']).not.toHaveProperty('right');
      expect(updated['107']).toHaveProperty('parent', 106);
      expect(updated['107']).toHaveProperty('left', 105);
      expect(updated['107']).not.toHaveProperty('right');
      expect(updated['105']).toHaveProperty('parent', 107);
      expect(updated['105']).not.toHaveProperty('left');
      expect(updated['105']).not.toHaveProperty('right');
    });
    test('move leaf node 1 level up just swap nodes', () => {
      const instance = tree.load(testData);
      const updated = tree.moveNode(instance, 106, 107);
      // <102> -> (105) -> (106) -> (107)
      // ==>
      // <102> -> (105) -> (107) -> (106)
      expect(updated['105']).toHaveProperty('parent', 102);
      expect(updated['105']).toHaveProperty('left', 107);
      expect(updated['105']).not.toHaveProperty('right');
      expect(updated['107']).toHaveProperty('parent', 105);
      expect(updated['107']).toHaveProperty('left', 106);
      expect(updated['107']).not.toHaveProperty('right');
      expect(updated['106']).toHaveProperty('parent', 107);
      expect(updated['106']).not.toHaveProperty('left');
      expect(updated['106']).not.toHaveProperty('right');
    });
    test('move branch node 1 level up just swap nodes', () => {
      const instance = tree.load(testData);
      const updated = tree.moveNode(instance, 106, 105);
      // <102> -> (105) -> (106) -> (107)
      // ==>
      // <102> -> (106) -> (105) -> (107)
      expect(updated['106']).toHaveProperty('parent', 102);
      expect(updated['106']).toHaveProperty('left', 105);
      expect(updated['106']).not.toHaveProperty('right');
      expect(updated['105']).toHaveProperty('parent', 106);
      expect(updated['105']).toHaveProperty('left', 107);
      expect(updated['105']).not.toHaveProperty('right');
      expect(updated['107']).toHaveProperty('parent', 105);
      expect(updated['107']).not.toHaveProperty('left');
      expect(updated['107']).not.toHaveProperty('right');
    });
    test('move branch node 1 level down to leaf just swap nodes', () => {
      const instance = tree.load(testData);
      const updated = tree.moveNode(instance, 107, 106);
      // <102> -> (105) -> (106) -> (107)
      // ==>
      // <102> -> (105) -> (107) -> (106)
      expect(updated['105']).toHaveProperty('parent', 102);
      expect(updated['105']).toHaveProperty('left', 107);
      expect(updated['105']).not.toHaveProperty('right');
      expect(updated['107']).toHaveProperty('parent', 105);
      expect(updated['107']).toHaveProperty('left', 106);
      expect(updated['107']).not.toHaveProperty('right');
      expect(updated['106']).toHaveProperty('parent', 107);
      expect(updated['106']).not.toHaveProperty('left');
      expect(updated['106']).not.toHaveProperty('right');
    });
    test('move branch node level down just swap nodes', () => {
      const instance = tree.load(testData);
      const updated = tree.moveNode(instance, 106, 105);
      // <102> -> (105) -> (106) -> (107)
      // ==>
      // <102> -> (106) -> (105) -> (107)
      expect(updated['106']).toHaveProperty('parent', 102);
      expect(updated['106']).toHaveProperty('left', 105);
      expect(updated['106']).not.toHaveProperty('right');
      expect(updated['105']).toHaveProperty('parent', 106);
      expect(updated['105']).toHaveProperty('left', 107);
      expect(updated['105']).not.toHaveProperty('right');
      expect(updated['107']).toHaveProperty('parent', 105);
      expect(updated['107']).not.toHaveProperty('right');
      expect(updated['107']).not.toHaveProperty('left');
    });
    test('move leaf node to another branch adds new leaf and removes leaf', () => {
      const instance = tree.load(testData);
      const updated = tree.moveNode(instance, 103, 107);
      /*
              <100>
              /    \
          <101>    <102>
          /   \      |
      (103)  (104) (105)
        |            |
      (107)        (106)
      */

      expect(updated['103']).toHaveProperty('parent', 101);
      expect(updated['103']).toHaveProperty('left', 107);
      expect(updated['103']).not.toHaveProperty('right');

      expect(updated['107']).toHaveProperty('parent', 103);
      expect(updated['107']).not.toHaveProperty('left');
      expect(updated['107']).not.toHaveProperty('right');

      expect(updated['106']).toHaveProperty('parent', 105);
      expect(updated['106']).not.toHaveProperty('right');
      expect(updated['106']).not.toHaveProperty('left');
    });
    test('move branch node to another branch changes both branches (l)', () => {
      const instance = tree.load(testData);
      const updated = tree.moveNode(instance, 101, 105, true);
      /*
              <100>
             /     \
          <101>    <102>
          /  \       |
      (105) (104)  (106)
        |            |
      (103)        (107)
      */

      expect(updated['101']).toHaveProperty('parent', 100);
      expect(updated['101']).toHaveProperty('left', 105);
      expect(updated['101']).toHaveProperty('right', 104);

      expect(updated['104']).toHaveProperty('parent', 101);
      expect(updated['104']).not.toHaveProperty('left');
      expect(updated['104']).not.toHaveProperty('right');

      expect(updated['105']).toHaveProperty('parent', 101);
      expect(updated['105']).toHaveProperty('left', 103);
      expect(updated['105']).not.toHaveProperty('right');

      expect(updated['103']).toHaveProperty('parent', 105);
      expect(updated['103']).not.toHaveProperty('left');
      expect(updated['103']).not.toHaveProperty('right');

      expect(updated['102']).toHaveProperty('parent', 100);
      expect(updated['102']).not.toHaveProperty('left');
      expect(updated['102']).toHaveProperty('right', 106);

      expect(updated['106']).toHaveProperty('parent', 102);
      expect(updated['106']).not.toHaveProperty('right');
      expect(updated['106']).toHaveProperty('left', 107);
    });
    test('move branch node to another branch changes both branches (r)', () => {
      const instance = tree.load(testData);
      const updated = tree.moveNode(instance, 101, 105, false);
      /*
              <100>
             /     \
          <101>    <102>
          /  \       |
      (103) (105)  (106)
              |      |
            (104)  (107)
      */

      expect(updated['101']).toHaveProperty('parent', 100);
      expect(updated['101']).toHaveProperty('left', 103);
      expect(updated['101']).toHaveProperty('right', 105);

      expect(updated['103']).toHaveProperty('parent', 101);
      expect(updated['103']).not.toHaveProperty('left');
      expect(updated['103']).not.toHaveProperty('right');

      expect(updated['105']).toHaveProperty('parent', 101);
      expect(updated['105']).toHaveProperty('left', 104);
      expect(updated['105']).not.toHaveProperty('right');

      expect(updated['104']).toHaveProperty('parent', 105);
      expect(updated['104']).not.toHaveProperty('left');
      expect(updated['104']).not.toHaveProperty('right');

      expect(updated['102']).toHaveProperty('parent', 100);
      expect(updated['102']).not.toHaveProperty('left');
      expect(updated['102']).toHaveProperty('right', 106);

      expect(updated['106']).toHaveProperty('parent', 102);
      expect(updated['106']).not.toHaveProperty('right');
      expect(updated['106']).toHaveProperty('left', 107);
    });
    test('move leaf node to another side of parent (r)', () => {
      const instance = tree.removeNode(tree.load(testData), 104);
      const updated = tree.moveNode(instance, 101, 103, false);
      /*
              <100>
             /     \
          <101>    <102>
             \       |
            (103)  (105)
                     |
                   (106)
                     |
                   (107)
      */
      expect(updated['101']).toHaveProperty('parent', 100);
      expect(updated['101']).not.toHaveProperty('left');
      expect(updated['101']).toHaveProperty('right', 103);
      expect(updated['103']).toHaveProperty('parent', 101);
      expect(updated['103']).not.toHaveProperty('left');
      expect(updated['103']).not.toHaveProperty('right');
    });
    test('move leaf node to another side of parent (l)', () => {
      const instance = tree.removeNode(tree.load(testData), 103);
      const updated = tree.moveNode(instance, 101, 104, true);
      /*
              <100>
             /     \
          <101>    <102>
           /         |
        (104)      (105)
                     |
                   (106)
                     |
                   (107)
      */
      expect(updated['101']).toHaveProperty('parent', 100);
      expect(updated['101']).not.toHaveProperty('right');
      expect(updated['101']).toHaveProperty('left', 104);
      expect(updated['104']).toHaveProperty('parent', 101);
      expect(updated['104']).not.toHaveProperty('left');
      expect(updated['104']).not.toHaveProperty('right');
    });
    test('attach moved node to proper side of parent automatically (l)', () => {
      const instance = tree.removeNode(tree.load(testData), 103);
      const updated = tree.moveNode(instance, 101, 105);
      /*
              <100>
             /     \
          <101>    <102>
           / \       |
       (105) (104) (106)
                     |
                   (107)
      */
      expect(updated['101']).toHaveProperty('parent', 100);
      expect(updated['101']).toHaveProperty('right', 104);
      expect(updated['101']).toHaveProperty('left', 105);
      expect(updated['104']).toHaveProperty('parent', 101);
      expect(updated['105']).not.toHaveProperty('left');
      expect(updated['105']).toHaveProperty('parent', 101);
      expect(updated['105']).not.toHaveProperty('left');
      expect(updated['106']).toHaveProperty('parent', 102);
      expect(updated['102']).toHaveProperty('right', 106);
    });
    test('attach moved node to proper side of parent automatically (r)', () => {
      const instance = tree.removeNode(tree.load(testData), 104);
      const updated = tree.moveNode(instance, 101, 105);
      /*
              <100>
             /     \
          <101>    <102>
           / \       |
       (103) (105) (106)
                     |
                   (107)
      */
      expect(updated['101']).toHaveProperty('parent', 100);
      expect(updated['101']).toHaveProperty('right', 105);
      expect(updated['101']).toHaveProperty('left', 103);
      expect(updated['103']).toHaveProperty('parent', 101);
      expect(updated['105']).not.toHaveProperty('left');
      expect(updated['105']).toHaveProperty('parent', 101);
      expect(updated['105']).not.toHaveProperty('left');
      expect(updated['106']).toHaveProperty('parent', 102);
      expect(updated['102']).toHaveProperty('right', 106);
    });
  });
  describe('hasAsParent', () => {
    it('returns true when third param is parent for second', () => {
      const instance = tree.load(testData);
      expect(tree.hasAsParent(instance, 103, 101)).toBe(true);
      expect(tree.hasAsParent(instance, 104, 101)).toBe(true);
      expect(tree.hasAsParent(instance, 103, 100)).toBe(true);
      expect(tree.hasAsParent(instance, 104, 100)).toBe(true);
      expect(tree.hasAsParent(instance, 107, 106)).toBe(true);
      expect(tree.hasAsParent(instance, 106, 102)).toBe(true);
      expect(tree.hasAsParent(instance, 107, 102)).toBe(true);
      expect(tree.hasAsParent(instance, 103, 100)).toBe(true);
      expect(tree.hasAsParent(instance, 107, 100)).toBe(true);
      expect(tree.hasAsParent(instance, 107, 102)).toBe(true);
    });
    it('returns false when third param is NOT parent for second', () => {
      const instance = tree.load(testData);
      expect(tree.hasAsParent(instance, 103, 104)).toBe(false);
      expect(tree.hasAsParent(instance, 104, 103)).toBe(false);
      expect(tree.hasAsParent(instance, 101, 102)).toBe(false);
      expect(tree.hasAsParent(instance, 101, 103)).toBe(false);
      expect(tree.hasAsParent(instance, 101, 104)).toBe(false);
      expect(tree.hasAsParent(instance, 107, 101)).toBe(false);
    });
  });
  describe('moveSubtree', () => {
    test('throws on not valid moves', () => {
      const instance = tree.load(testData);
      expect(() => {
        tree.moveSubtree(instance, -105, 107);
      }).toThrow();
      expect(() => {
        tree.moveSubtree(instance, 105, -107);
      }).toThrow();
      expect(() => {
        tree.moveSubtree(instance, 107, 101);
      }).not.toThrow(); // Valid
      expect(() => {
        tree.moveSubtree(instance, 106, 101);
      }).toThrow();
      expect(() => {
        tree.moveSubtree(instance, 107, 100);
      }).toThrow();
      expect(() => {
        tree.moveSubtree(instance, 100, 107);
      }).toThrow();
      expect(() => {
        tree.moveSubtree(instance, 102, 103, false);
      }).toThrow();
      expect(() => {
        tree.moveSubtree(instance, 102, 103, true);
      }).not.toThrow();
      expect(() => {
        tree.moveSubtree(instance, 103, 101);
      }).toThrow();
      expect(() => {
        tree.moveSubtree(instance, 104, 101);
      }).toThrow();
      expect(() => {
        tree.moveSubtree(instance, 107, 104, false);
      }).toThrow();
      expect(() => {
        tree.moveSubtree(instance, 107, -104);
      }).toThrow();
      expect(() => {
        tree.moveSubtree(instance, 101, 107);
      }).toThrow();
    });
    test('can move leaf nodes (left)', () => {
      const instance = tree.load(testData);
      const updated = tree.moveSubtree(instance, 103, 107, true);
      /*
              <100>
              /    \
          <101>    <102>
          /   \      |
      (103) (104)  (105)
        /            |
      (107)        (106)
      */

      expect(updated['103']).toHaveProperty('parent', 101);
      expect(updated['103']).toHaveProperty('left', 107);
      expect(updated['103']).not.toHaveProperty('right');

      expect(updated['107']).toHaveProperty('parent', 103);
      expect(updated['107']).not.toHaveProperty('left');
      expect(updated['107']).not.toHaveProperty('right');

      expect(updated['106']).toHaveProperty('parent', 105);
      expect(updated['106']).not.toHaveProperty('left');
      expect(updated['106']).not.toHaveProperty('right');
    });
    test('can move leaf nodes (right)', () => {
      const instance = tree.load(testData);
      instance['103'].fork = true;
      const updated = tree.moveSubtree(instance, 103, 107, false);
      /*
              <100>
              /    \
          <101>    <102>
          /   \      |
      <103> (104)  (105)
        \            |
      (107)        (106)
      */

      expect(updated['103']).toHaveProperty('parent', 101);
      expect(updated['103']).toHaveProperty('right', 107);
      expect(updated['103']).not.toHaveProperty('left');

      expect(updated['107']).toHaveProperty('parent', 103);
      expect(updated['107']).not.toHaveProperty('left');
      expect(updated['107']).not.toHaveProperty('right');

      expect(updated['106']).toHaveProperty('parent', 105);
      expect(updated['106']).not.toHaveProperty('left');
      expect(updated['106']).not.toHaveProperty('right');
    });
    test('can move branch nodes', () => {
      const instance = tree.load(testData);
      const updated = tree.moveSubtree(instance, 103, 106, true);
      /*
              <100>
              /    \
          <101>    <102>
          /   \      |
      (103) (104)  (105)
        |
      (106)        
        |
      (107)
      */

      expect(updated['103']).toHaveProperty('parent', 101);
      expect(updated['103']).toHaveProperty('left', 106);
      expect(updated['103']).not.toHaveProperty('right');

      expect(updated['106']).toHaveProperty('parent', 103);
      expect(updated['106']).toHaveProperty('left', 107);
      expect(updated['106']).not.toHaveProperty('right');

      expect(updated['107']).toHaveProperty('parent', 106);
      expect(updated['107']).not.toHaveProperty('left');
      expect(updated['107']).not.toHaveProperty('right');

      expect(updated['105']).toHaveProperty('parent', 102);
      expect(updated['105']).not.toHaveProperty('left');
      expect(updated['105']).not.toHaveProperty('right');
    });
    test('can move complex branches to leaf nodes', () => {
      const instance = tree.load(testData);
      const updated = tree.moveSubtree(instance, 107, 101, true);
      /*
          <100>
            |
          <102>
            |
          (105)
            |
          (106)
            |
          (107)
            |
          <101>
          /   \
      (103) (104)
     */

      expect(updated['100']).toHaveProperty('parent', null);
      expect(updated['100']).not.toHaveProperty('left');
      expect(updated['100']).toHaveProperty('right', 102);

      expect(updated['107']).toHaveProperty('parent', 106);
      expect(updated['107']).toHaveProperty('left', 101);
      expect(updated['107']).not.toHaveProperty('right');

      expect(updated['101']).toHaveProperty('parent', 107);
      expect(updated['101']).toHaveProperty('left', 103);
      expect(updated['101']).toHaveProperty('right', 104);
    });
    test('can attach complex branches to free slots (l)', () => {
      const instance = tree.load(testData);
      const updated = tree.moveSubtree(instance, 102, 101);
      /*
              <100>
                   \
                   <102>
                   /   \
               <101>    (105)
                /  \      |
            (103) (104) (106)
                          |
                        (107)
      */

      expect(updated['100']).toHaveProperty('parent', null);
      expect(updated['100']).not.toHaveProperty('left');
      expect(updated['100']).toHaveProperty('right', 102);

      expect(updated['105']).toHaveProperty('parent', 102);
      expect(updated['105']).toHaveProperty('left', 106);
      expect(updated['102']).toHaveProperty('right', 105);
      expect(updated['102']).toHaveProperty('left', 101);
      expect(updated['101']).toHaveProperty('parent', 102);
    });
    test('move fork node to leaf', () => {
      const instance = tree.load(testData);
      const updated = tree.moveSubtree(instance, 104, 102);
      /*
              <100>
             /     
          <101>     
           /  \     
        (103) (104) 
                |   
              <102> 
                \
                (105)
                  |
                (106)
                  |
                (107)
      */
      expect(updated['102']).toHaveProperty('parent', 104);
      expect(updated['104']).not.toHaveProperty('right');
      expect(updated['104']).toHaveProperty('left', 102);
      expect(updated['100']).not.toHaveProperty('right', 105);
      expect(updated['105']).toHaveProperty('parent', 102);
    });
    test('can move leaf nodes automatic left alignemnt', () => {
      const instance = tree.load(testData);
      const updated = tree.moveSubtree(instance, 103, 107);
      /*
              <100>
              /    \
          <101>    <102>
          /   \      |
      (103) (104)  (105)
        /            |
      (107)        (106)
      */

      expect(updated['103']).toHaveProperty('parent', 101);
      expect(updated['103']).toHaveProperty('left', 107);
      expect(updated['103']).not.toHaveProperty('right');

      expect(updated['107']).toHaveProperty('parent', 103);
      expect(updated['107']).not.toHaveProperty('left');
      expect(updated['107']).not.toHaveProperty('right');

      expect(updated['106']).toHaveProperty('parent', 105);
      expect(updated['106']).not.toHaveProperty('left');
      expect(updated['106']).not.toHaveProperty('right');
    });
    test('can move leaf nodes with automatric right alugnment', () => {
      const instance = tree.removeNode(tree.load(testData), 104);
      instance['103'].fork = true;
      const updated = tree.moveSubtree(instance, 101, 107);
      /*
              <100>
              /    \
          <101>    <102>
          /   \      |
      <103> (107)  (105)
                     |
                   (106)
      */
      expect(updated['101']).toHaveProperty('parent', 100);
      expect(updated['101']).toHaveProperty('left', 103);
      expect(updated['101']).toHaveProperty('right', 107);

      expect(updated['103']).toHaveProperty('parent', 101);
      expect(updated['103']).not.toHaveProperty('left');
      expect(updated['103']).not.toHaveProperty('right');

      expect(updated['107']).toHaveProperty('parent', 101);
      expect(updated['107']).not.toHaveProperty('left');
      expect(updated['107']).not.toHaveProperty('right');

      expect(updated['106']).toHaveProperty('parent', 105);
      expect(updated['106']).not.toHaveProperty('left');
      expect(updated['106']).not.toHaveProperty('right');
    });
  });
});
