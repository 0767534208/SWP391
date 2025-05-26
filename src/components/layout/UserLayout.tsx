import { Outlet } from "react-router-dom";
import Footer from "./Footer";
import Navbar from "./Navbar";

export default function UserLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      {/* <nav className="bg-blue-500 p-4 text-white flex gap-4">
        <Link to="/" className="hover:underline">Trang chủ</Link>
        <Link to="/profile" className="hover:underline">Hồ sơ</Link>
      </nav> */}

      <Navbar/>

      {/* Nội dung trang */}

        <Outlet /> {/* Hiển thị trang con */}
      <Footer/>
    </div>
  );
}