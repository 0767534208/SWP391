import { BrowserRouter as Router, Routes, Route,Navigate } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n/i18n';
import './index.css';
import './App.css';

import UserLayout from './components/layout/UserLayout'; // Đường dẫn tới file UserLayout
import Home from './pages/Home/Home';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Booking from './pages/Booking/Booking';
import Blog from './pages/Blog/Blog';
import BlogDetail from './pages/Blog/BlogDetail';
import CycleTracker from './pages/CycleTracker/CycleTracker';

function App() {
  return (
    <I18nextProvider i18n={i18n}>
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
        </Routes>
      </Router>
    </I18nextProvider>
  );
}

export default App;