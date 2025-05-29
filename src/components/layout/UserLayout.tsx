import { Outlet, useLocation } from "react-router-dom";
import Footer from "./Footer";
import Navbar from "../navbar/Navbar";

export default function UserLayout() {
  const location = useLocation();
  const isAuthPage = location.pathname.includes('/auth/');

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar/>
        <Outlet /> {/* Hiển thị trang con */}
      <Footer/>
    </div>
  );
}