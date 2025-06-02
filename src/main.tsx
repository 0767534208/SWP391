import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import './global.css'

// Force scroll to top on page refresh
if (history.scrollRestoration) {
  history.scrollRestoration = 'manual';
}

// Ensure we start at the top of the page
window.onload = function() {
  window.scrollTo(0, 0);
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
