import './polyfills.js'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

window.onerror = function(msg, url, line, col, error) {
  const div = document.createElement('div');
  div.style.cssText = 'position:fixed;top:0;left:0;right:0;background:#ef4444;color:white;padding:12px;font-family:monospace;font-size:12px;z-index:99999;white-space:pre-wrap;';
  div.textContent = `ERROR: ${msg}\n${error?.stack || ''}`;
  document.body.prepend(div);
};

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
)
