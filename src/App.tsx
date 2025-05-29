import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './index.css';
import './App.css';

import UserLayout from './components/layout/UserLayout'; // Đường dẫn tới file UserLayout
import Home from './pages/Home/Home';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Booking from './pages/Booking/Booking';
import Blog from './pages/Blog/Blog';
import BlogDetail from './pages/Blog/BlogDetail';
import ConfirmBooking from './pages/Booking/ConfirmBooking';
import ConfirmBooking from './pages/Booking/ConfirmBooking';

function App() {
  return (
    <Router>
      <Routes>
        {/* Route dành cho người dùng */}
        <Route path="/" element={<UserLayout />}>
          <Route index element={<Home />} />
          <Route path="auth/login" element={<Login />} />
          <Route path="auth/register" element={<Register />} />
          <Route path="booking" element={<Booking />} />
          <Route path="blog" element={<Blog />} />
          <Route path="/blog/:id" element={<BlogDetail />} />
          <Route path="/confirm-booking" element={<ConfirmBooking />} />
        </Route>

        {/* Route dành cho admin */}
      </Routes>
    </Router>
  );
}

export default App;