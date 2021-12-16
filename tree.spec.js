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
});
