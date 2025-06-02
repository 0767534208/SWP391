import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// This component ensures that the page scrolls to the top when navigating to a new route
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Immediate scroll on route change
    window.scrollTo(0, 0);
    
    // Add a small delay to ensure scroll happens after render
    const timeoutId = setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: 'auto'
      });
    }, 0);
    
    return () => clearTimeout(timeoutId);
  }, [pathname]);

  return null;
}

export default ScrollToTop; 