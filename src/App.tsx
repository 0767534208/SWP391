import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import './index.css';
import './App.css';

import UserLayout from './components/layout/UserLayout';
import AdminLayout from './components/layout/AdminLayout';
import ManagerLayout from './components/layout/ManagerLayout';
import ConsultantLayout from './components/layout/ConsultantLayout';
import StaffLayout from './components/layout/StaffLayout';
import ScrollToTop from './components/layout/ScrollToTop';
import Home from './pages/Home/Home';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import VerifyOTP from './pages/Auth/VerifyOTP';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ResetPassword from './pages/Auth/ResetPassword';
import Booking from './pages/Booking/Booking';
import UserBlog from './pages/Blog/UserBlog';
import BlogDetail from './pages/Blog/BlogDetail';
import CycleTracker from './pages/CycleTracker/CycleTracker';
import Profile from './pages/User/Profile';
import ConsultantProfile from './pages/Consultant/ConsultantProfile';
import TestResults from './pages/User/TestResultUser';
import TestResultConsultant from './pages/Consultant/TestResultConsultant';
import TestResultConsultantDetail from './pages/Consultant/TestResultConsultantDetail';
import ConsultantAppointments from './pages/Appointments/ConsultantAppointments';
import Services from './pages/Services/Services';
import QnA from './pages/QnA/QnA';
import Payment from './pages/Payment/Payment';
import PaymentSuccess from './pages/Payment/PaymentSuccess';

import Dashboard from './pages/Admin/Dashboard';
import Users from './pages/Admin/User';
import Appointments from './pages/Admin/Appointment';
import Consultants from './pages/Admin/Consultant';

import ServiceManagement from './pages/Manager/ServiceManagement';
import CategoryManagement from './pages/Manager/CategoryManagement';
import BlogManagement from './pages/Manager/BlogManagement';
import SlotManagement from './pages/Manager/SlotManagement';
import SlotCreation from './pages/Manager/SlotCreation';
import WeeklyCalendar from './pages/Manager/WeeklyCalendar';
import StaffAppointments from './pages/Staff/StaffAppointments';
import TestResultView from './pages/Staff/TestResultView';
import TestResultManagementStaff from './pages/Staff/TestResultManagementStaff';
import TestResultEdit from './pages/Staff/TestResultEdit';
import TestResultForm from './pages/Staff/TestResultForm';

// Import API Testers
import ApiTesters from './components/ApiTesters';

// Admin route wrapper component
import type { ReactNode } from 'react';
import ConfirmBooking from './pages/Booking/ConfirmBooking';
import Contact from './pages/Contact/Contact';

// Component to redirect based on user role
const RoleBasedRedirect = () => {
  useEffect(() => {
    const userRole = localStorage.getItem('userRole')?.toLowerCase();
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    
    if (isLoggedIn && userRole) {
      switch (userRole) {
        case 'admin':
          window.location.href = '/admin';
          break;
        case 'manager':
          window.location.href = '/manager/services';
          break;
        case 'staff':
          window.location.href = '/staff/appointments';
          break;
        case 'consultant':
          window.location.href = '/consultant/profile';
          break;
        default:
          // For regular users, stay on the homepage
          break;
      }
    }
  }, []);
  
  return null;
};

// Admin route wrapper component
type AdminRouteProps = {
  children: ReactNode;
};

const AdminRoute = ({ children }: AdminRouteProps) => {
  const userRole = localStorage.getItem('userRole')?.toLowerCase();
  const isAdmin = userRole === 'admin';
  return isAdmin ? <>{children}</> : <Navigate to="/auth/login" replace />;
};

// Consultant route wrapper component
type ConsultantRouteProps = {
  children: ReactNode;
};

const ConsultantRoute = ({ children }: ConsultantRouteProps) => {
  const userRole = localStorage.getItem('userRole')?.toLowerCase();
  const isConsultant = userRole === 'consultant';
  return isConsultant ? <>{children}</> : <Navigate to="/auth/login" replace />;
};

// Manager route wrapper component
type ManagerRouteProps = {
  children: ReactNode;
};

const ManagerRoute = ({ children }: ManagerRouteProps) => {
  const userRole = localStorage.getItem('userRole')?.toLowerCase();
  const isManager = userRole === 'manager';
  return isManager ? <>{children}</> : <Navigate to="/auth/login" replace />;
};

// Staff route wrapper component
type StaffRouteProps = {
  children: ReactNode;
};

const StaffRoute = ({ children }: StaffRouteProps) => {
  const userRole = localStorage.getItem('userRole')?.toLowerCase();
  const isStaff = userRole === 'staff';
  return isStaff ? <>{children}</> : <Navigate to="/auth/login" replace />;
};

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* Route dành cho người dùng */}
        <Route path="/" element={<UserLayout />}>
          <Route index element={<><RoleBasedRedirect /><Home /></>} />
          <Route path="/auth" element={<Navigate to="/auth/login" replace />} />
          <Route path="auth/login" element={<Login />} />
          <Route path="auth/register" element={<Register />} />
          <Route path="auth/verify-otp" element={<VerifyOTP />} />
          <Route path="auth/forgot-password" element={<ForgotPassword />} />
          <Route path="auth/reset-password" element={<ResetPassword />} />
          <Route path="booking" element={<Booking />} />
          <Route path="services" element={<Services />} />
          <Route path="blogUser" element={<UserBlog />} />
          <Route path="/blog/:id" element={<BlogDetail />} />
          <Route path="CycleTracker" element={<CycleTracker />} />
          <Route path="profile" element={<Profile />} />
          <Route path="confirm-booking" element={<ConfirmBooking />} />
          <Route path="payment" element={<Payment />} />
          <Route path="payment-success/:appointmentId" element={<PaymentSuccess />} />
          <Route path="contact" element={<Contact />} />
          <Route path="test-results/:id" element={<TestResults />} />
          <Route path="qna" element={<QnA />} />
          {/* API Testers route */}
          <Route path="api-testers" element={<ApiTesters />} />
        </Route>

        {/* Route dành cho consultant */}
        <Route path="/consultant" element={
          <ConsultantRoute>
            <ConsultantLayout />
          </ConsultantRoute>
        }>
          <Route index element={<ConsultantProfile />} />
          <Route path="profile" element={<ConsultantProfile />} />
          <Route path="appointments" element={<ConsultantAppointments />} />
          <Route path="test-results" element={<TestResultConsultant />} />
          <Route path="test-results/:id" element={<TestResultConsultantDetail />} />
        </Route>

        {/* Route dành cho manager */}
        <Route path="/manager" element={
          <ManagerRoute>
            <ManagerLayout />
          </ManagerRoute>
        }>
          <Route index element={<ServiceManagement />} />
          <Route path="services" element={<ServiceManagement />} />
          <Route path="categories" element={<CategoryManagement />} />
          <Route path="blogs" element={<BlogManagement />} />
          <Route path="slots" element={<SlotManagement />} />
          <Route path="slot-calendar" element={<WeeklyCalendar />} />
          <Route path="slot-creation" element={<SlotCreation />} />
        </Route>

        {/* Route dành cho staff */}
        <Route path="/staff" element={
          <StaffRoute>
            <StaffLayout />
          </StaffRoute>
        }>
          <Route index element={<StaffAppointments />} />
          <Route path="appointments" element={<StaffAppointments />} />
          <Route path="test-results" element={<TestResultManagementStaff />} />
          <Route path="test-results/new" element={<TestResultForm />} />
          <Route path="test-results/:id" element={<TestResultView />} />
          <Route path="test-results/edit/:id" element={<TestResultEdit />} />
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
          <Route path="consultants" element={<Consultants />} />
          {/* API Testers route for admins */}
          <Route path="api-testers" element={<ApiTesters />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;