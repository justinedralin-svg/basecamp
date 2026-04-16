/**
 * Minimal module-level toast system.
 * Call showToast() from anywhere — no prop drilling required.
 * Register the setter once in App via <Toast />.
 */
let _handler = null;

export function registerToastSetter(fn) {
  _handler = fn;
}

/**
 * @param {string} message
 * @param {'success'|'error'|'info'} [type]
 */
export function showToast(message, type = 'success') {
  if (_handler) {
    _handler({ message, type, id: Date.now() + Math.random() });
  }
}
