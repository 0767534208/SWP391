import { Outlet } from "react-router-dom";
import Footer from "./Footer";
import Navbar from "./Navbar";
import "./UserLayout.css";
import { useEffect } from "react";

export default function UserLayout() {
  // Force scroll to top when layout mounts or updates
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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