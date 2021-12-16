const tree = require('./tree');
const testData = [
  { id: 100, parent: null, left: null },
  { id: 101, parent: 100, left: true },
  { id: 102, parent: 100, left: false },
  { id: 103, parent: 101, left: true },
  { id: 104, parent: 101, left: false },
  { id: 105, parent: 102, left: true },
  { id: 106, parent: 105, left: true },
  { id: 107, parent: 106, left: true }
];

describe('tree', () => {
  it('imports without errors', () => {
    expect(tree).toBeDefined();
    expect(tree).toHaveProperty('valid');
  });
  describe('validate', () => {
    it('returns true when data is valid', () => {
      expect(
        tree.valid([
          {
            id: 100,
            parent: null,
            left: null
          },
          {
            id: 101,
            parent: 100,
            left: true
          }
        ])
      ).toBe(true);
    });
    it('returns false when data is not valid', () => {
      expect(
        tree.valid([
          {
            id: 100
          },
          {
            id: 101,
            parent: 100,
            left: true
          }
        ])
      ).toBeFalsy();
      expect(tree.valid([])).toBeFalsy();
    });
  });
  describe('load', () => {
    it('returns tree object', () => {
      const result = tree.load(testData);
      expect(result).toHaveProperty('100.tree');
      expect(result).toHaveProperty('100.left', 101);
      expect(result).toHaveProperty('100.right', 102);
      expect(result).toHaveProperty('101.left', 103);
      expect(result).toHaveProperty('101.right', 104);
      expect(result).toHaveProperty('105.parent', 102);
      expect(result['100'].tree()).toEqual(result);
      expect(result['100'].isLeft()).toBeFalsy();
      expect(result['101'].isLeft()).toBeTruthy();
      expect(result['102'].isLeft()).toBeFalsy();
      expect(result['100'].children()).toHaveLength(2);
    });
  });
  describe('pack', () => {
    it('returns initial object', () => {
      const result = tree.pack(tree.load(testData));
      expect(result).toEqual(testData);
    });
  });
  describe('addChildrensMethod', () => {
    it('adds method', () => {
      expect(tree.addChildrensMethod({})).toHaveProperty('children');
    });
    it('children method works', () => {
      const result = {};
      tree.addChildrensMethod(result);
      expect(result.children()).toHaveLength(0);
      result.left = true;
      expect(result.children()).toHaveLength(1);
      result.right = true;
      expect(result.children()).toHaveLength(2);
      delete result.left;
      expect(result.children()).toHaveLength(1);
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
        tree.insert(instance, -1, 1, true).toThrow();
      });
    });
    it('not throws error when parent is in tree', () => {
      const instance = tree.load(testData);
      expect(() => {
        tree.insert(instance, 101, 1, true).not.toThrow();
      });
    });
    it('adds new node on leaf node', () => {
      const instance = tree.load(testData);
      const firstUpdated = tree.insert(instance, 107, 1000, true);
      const secondUpdated = tree.insert(firstUpdated, 107, 1001, false);
      const leftNode = secondUpdated['1000'];
      const rightNode = secondUpdated['1001'];
      expect(leftNode).toHaveProperty('id', 1000);
      expect(leftNode).toHaveProperty('parent', 107);
      expect(leftNode.isLeft()).toBe(true);
      expect(leftNode.children).toHaveLength(0);
      expect(rightNode).toHaveProperty('id', 1001);
      expect(rightNode).toHaveProperty('parent', 107);
      expect(rightNode.isLeft()).toBe(false);
      expect(rightNode.children).toHaveLength(0);

      expect(instance['107']).not.toHaveProperty('left');
      expect(instance['107']).not.toHaveProperty('right');
      expect(instance['107'].children()).toHaveLength(0);

      expect(firstUpdated['107']).toHaveProperty('left', 1000);
      expect(firstUpdated['107']).not.toHaveProperty('right');
      //expect(firstUpdated['107'].children()).toHaveLength(1);

      expect(secondUpdated['107']).toHaveProperty('left', 1000);
      expect(secondUpdated['107']).toHaveProperty('right', 1001);
      expect(secondUpdated['107'].children()).toHaveLength(2);
    });
  });
  describe('insert left & right', () => {
    it('both functions are working', () => {
      const instance = tree.load(testData);
      const leftNode = tree.insertLeft(instance, 107, 1000);
      const rightNode = tree.insertRight(instance, 107, 1001);
      expect(instance['107']).toHaveProperty('left', 1000);
      expect(instance['107']).toHaveProperty('right', 1001);
      expect(instance['107'].children()).toHaveLength(2);
    });
  });
});
