import { Outlet } from "react-router-dom";
import Footer from "./Footer";
import Navbar from "../navbar/Navbar";

export default function UserLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar/>
        <Outlet /> {/* Hiển thị trang con */}
      <Footer/>
    </div>
  );
}