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
  
  // Check login status on app start
  const checkLoginStatus = () => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const userRole = localStorage.getItem('userRole')?.toLowerCase();
    
    if (isLoggedIn && userRole) {
      // Redirect based on role if user is on the homepage
      if (window.location.pathname === '/' || window.location.pathname === '') {
        switch (userRole) {
          case 'admin':
            window.location.href = '/admin';
            break;
          case 'manager':
            window.location.href = '/manager';
            break;
          case 'staff':
            window.location.href = '/staff';
            break;
          case 'consultant':
            window.location.href = '/consultant/profile';
            break;
          default:
            // For regular users, stay on the homepage
            break;
        }
      }
    }
  };
  
  checkLoginStatus();
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
