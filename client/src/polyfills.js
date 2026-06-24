if (typeof global === 'undefined') {
  (window).global = window;
}
if (typeof process === 'undefined') {
  (window).process = { env: { NODE_ENV: 'development' }, nextTick: (fn) => setTimeout(fn, 0) };
}
import { Buffer } from 'buffer';
window.Buffer = Buffer;
