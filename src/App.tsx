import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';
import './App.css';

import UserLayout from './components/layout/UserLayout'; // Đường dẫn tới file UserLayout
import AdminLayout from './components/layout/AdminLayout'; // Admin Layout
import Home from './pages/Home/Home';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Booking from './pages/Booking/Booking';
import Blog from './pages/Blog/Blog';
import BlogDetail from './pages/Blog/BlogDetail';
import CycleTracker from './pages/CycleTracker/CycleTracker';

// Admin pages
import Dashboard from './pages/Admin/Dashboard';
import Users from './pages/Admin/Users';
import Appointments from './pages/Admin/Appointments';
import TestResults from './pages/Admin/TestResults';
import Consultants from './pages/Admin/Consultants';
import AdminBlog from './pages/Admin/Blog';
import Reports from './pages/Admin/Reports';

// Admin route wrapper component
const AdminRoute = ({ children }: { children: JSX.Element }) => {
  const isAdmin = localStorage.getItem('userRole') === 'admin';
  return isAdmin ? children : <Navigate to="/auth/login" replace />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Route dành cho người dùng */}
        <Route path="/" element={<UserLayout />}>
          <Route index element={<Home />} />
          <Route path="/auth" element={<Navigate to="/auth/login" replace />} />
          <Route path="auth/login" element={<Login />} />
          <Route path="auth/register" element={<Register />} />
          <Route path="booking" element={<Booking />} />
          <Route path="blog" element={<Blog />} />
          <Route path="/blog/:id" element={<BlogDetail />} />
          <Route path="CycleTracker" element={<CycleTracker />} />
        </Route>

        {/* Route dành cho admin */}
        <Route path="/admin" element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="appointments" element={<Appointments />} />
          <Route path="tests" element={<TestResults />} />
          <Route path="consultants" element={<Consultants />} />
          <Route path="blog" element={<AdminBlog />} />
          <Route path="reports" element={<Reports />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;