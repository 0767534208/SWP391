import { Outlet, useNavigate } from "react-router-dom";
import Footer from "./Footer";
import Navbar from "./Navbar";
import "./UserLayout.css";
import { useEffect } from "react";

export default function UserLayout() {
  const navigate = useNavigate();
  
  // Force scroll to top when layout mounts or updates
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  // Check user role and redirect if needed
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const userRole = localStorage.getItem('userRole')?.toLowerCase();
    
    // Only redirect if on the main page
    if (isLoggedIn && userRole && window.location.pathname === '/') {
      switch (userRole) {
        case 'admin':
          navigate('/admin');
          break;
        case 'manager':
          navigate('/manager');
          break;
        case 'staff':
          navigate('/staff');
          break;
        case 'consultant':
          navigate('/consultant/profile');
          break;
        default:
          // For regular users, stay on the homepage
          break;
      }
    }
  }, [navigate]);

  return (
    <div className="flex-col min-h-screen">
      <Navbar/>
      <div className="flex-grow content-wrapper">
        <Outlet /> {/* Hiển thị trang con */}
      </div>
      <Footer/>
    </div>
  );
}