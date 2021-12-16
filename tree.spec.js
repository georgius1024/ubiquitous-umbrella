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
      expect(result).toHaveProperty('100.left', 101);
      expect(result).toHaveProperty('100.right', 102);
      expect(result).toHaveProperty('101.left', 103);
      expect(result).toHaveProperty('101.right', 104);
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
      expect(rightNode).toHaveProperty('id', 1001);
      expect(rightNode).toHaveProperty('parent', 107);

      expect(instance['107']).not.toHaveProperty('left');
      expect(instance['107']).not.toHaveProperty('right');

      expect(firstUpdated['107']).toHaveProperty('left', 1000);
      expect(firstUpdated['107']).not.toHaveProperty('right');

      expect(secondUpdated['107']).toHaveProperty('left', 1000);
      expect(secondUpdated['107']).toHaveProperty('right', 1001);
    });
    it('replaces old child node', () => {
      const instance = tree.load(testData);
      const updated = tree.insert(instance, 101, 1000, true);
      expect(instance['101']).not.toHaveProperty('left', 1000);
      expect(updated['101']).toHaveProperty('left', 1000);
      expect(updated['1000']).toHaveProperty('left', 103);
      expect(updated['103']).toHaveProperty('parent', 1000);
    });
  });
  describe('insert left & right', () => {
    it('both functions are working', () => {
      const instance = tree.load(testData);
      const updated = tree.insertRight(
        tree.insertLeft(instance, 107, 1000),
        107,
        1001
      );
      expect(updated['107']).toHaveProperty('left', 1000);
      expect(updated['107']).toHaveProperty('right', 1001);
    });
  });
  describe('remove', () => {
    it('throws error when node not found', () => {
      const instance = tree.load(testData);
      expect(() => {
        tree.remove(instance, -1).toThrow();
      });
    });
    it('throws error when removing root', () => {
      const instance = tree.load(testData);
      expect(() => {
        tree.remove(instance, 100).toThrow();
      });
    });
    it('removes leafs nodes', () => {
      const instance = tree.load(testData);
      const updated = tree.remove(instance, 107);
      expect(updated['107']).toBeFalsy();
    });
    it('removes parents with 1 child', () => {
      const instance = tree.load(testData);
      const updated = tree.remove(instance, 106);
      expect(updated['105']).toBeTruthy();
      expect(updated['106']).toBeFalsy();
      expect(updated['107']).toBeTruthy();
      expect(updated['105']).toHaveProperty('left', 107);
      expect(updated['107']).toHaveProperty('parent', 105);
    });
    it('removes parents with 2 child', () => {
      const instance = tree.load(testData);
      const updated = tree.remove(instance, 105);
      expect(updated['105']).toBeFalsy();
      expect(updated['106']).toBeTruthy();
      expect(updated['107']).toBeTruthy();
      expect(updated['102']).toHaveProperty('left', 106);
      expect(updated['106']).toHaveProperty('parent', 102);
    });
    it('removes a branch, keeping left side', () => {
      const instance = tree.load(testData);
      const updated = tree.remove(instance, 101, true);
      expect(updated['101']).toBeFalsy();
      expect(updated['103']).toBeTruthy();
      expect(updated['104']).toBeFalsy();
      expect(updated['100']).toHaveProperty('left', 103);
      expect(updated['103']).toHaveProperty('parent', 100);
    });
    it('removes a branch, keeping right side', () => {
      const instance = tree.load(testData);
      const updated = tree.remove(instance, 101, false);
      expect(updated['101']).toBeFalsy();
      expect(updated['103']).toBeFalsy();
      expect(updated['104']).toBeTruthy();
      expect(updated['100']).toHaveProperty('left', 104);
      expect(updated['104']).toHaveProperty('parent', 100);
    });
  });
});
