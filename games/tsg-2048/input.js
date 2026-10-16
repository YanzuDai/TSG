(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.TSG2048Input = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  function directionFromKey(key) {
    const normalized = String(key || '').toLowerCase();
    const map = {
      arrowup: 'up',
      arrowdown: 'down',
      arrowleft: 'left',
      arrowright: 'right',
      w: 'up',
      s: 'down',
      a: 'left',
      d: 'right',
    };
    return map[normalized] || null;
  }

  function directionFromSwipe(dx, dy, threshold = 30) {
    if (Math.max(Math.abs(dx), Math.abs(dy)) < threshold) return null;
    if (Math.abs(dx) >= Math.abs(dy)) return dx >= 0 ? 'right' : 'left';
    return dy >= 0 ? 'down' : 'up';
  }

  return { directionFromKey, directionFromSwipe };
});
