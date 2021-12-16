function validate(data) {
  return data.every((item) => id in item && parent in item && left in item);
}
function load(data) {
  const map = data.reduce((map, item) => ({ ...map, [item.id]: item }), {});
  Object.keys(map).forEach((item) => {});
}

module.exports = {
  load
};
