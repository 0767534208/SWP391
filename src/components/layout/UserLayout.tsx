import { Outlet, useLocation } from "react-router-dom";
import Footer from "./Footer";
import Navbar from "./Navbar";

export default function UserLayout() {
  const location = useLocation();
  const isAuthPage = location.pathname.includes('/auth/');

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      {/* <nav className="bg-blue-500 p-4 text-white flex gap-4">
        <Link to="/" className="hover:underline">Trang chủ</Link>
        <Link to="/profile" className="hover:underline">Hồ sơ</Link>
      </nav> */}

      <Navbar/>

      {/* Main content with flex-grow to take all available space */}
      <main className={`flex-grow ${isAuthPage ? 'flex flex-col' : ''}`}>
        <Outlet /> {/* Display the child route */}
      </main>

      <Footer/>
    </div>
  );
}