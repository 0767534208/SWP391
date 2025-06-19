import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
import Booking from './pages/Booking/Booking';
import UserBlog from './pages/Blog/UserBlog';
import BlogDetail from './pages/Blog/BlogDetail';
import CycleTracker from './pages/CycleTracker/CycleTracker';
import Profile from './pages/User/Profile';
import ConsultantProfile from './pages/Consultant/ConsultantProfile';
import ConsultantDashboard from './pages/Consultant/ConsultantDashboard';
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

import ManagerDashboard from './pages/Manager/ManagerDashboard';
import ServiceManagement from './pages/Manager/ServiceManagement';
import BlogManagement from './pages/Manager/BlogManagement';
import SlotManagement from './pages/Manager/SlotManagement';
import SlotCreation from './pages/Manager/SlotCreation';

import StaffDashboard from './pages/Staff/StaffDashboard';
import StaffAppointments from './pages/Staff/StaffAppointments';
import TestResultView from './pages/Staff/TestResultView';
import TestResultInput from './pages/Staff/TestResultInput';

// Admin route wrapper component
import type { ReactNode } from 'react';
import ConfirmBooking from './pages/Booking/ConfirmBooking';
import Contact from './pages/Contact/Contact';

// Admin route wrapper component
type AdminRouteProps = {
  children: ReactNode;
};

const AdminRoute = ({ children }: AdminRouteProps) => {
  const isAdmin = localStorage.getItem('userRole') === 'admin';
  return isAdmin ? <>{children}</> : <Navigate to="/auth/login" replace />;
};

// Consultant route wrapper component
type ConsultantRouteProps = {
  children: ReactNode;
};

const ConsultantRoute = ({ children }: ConsultantRouteProps) => {
  const isConsultant = localStorage.getItem('userRole') === 'consultant';
  return isConsultant ? <>{children}</> : <Navigate to="/auth/login" replace />;
};

// Manager route wrapper component
type ManagerRouteProps = {
  children: ReactNode;
};

const ManagerRoute = ({ children }: ManagerRouteProps) => {
  const isManager = localStorage.getItem('userRole') === 'manager';
  return isManager ? <>{children}</> : <Navigate to="/auth/login" replace />;
};

// Staff route wrapper component
type StaffRouteProps = {
  children: ReactNode;
};

const StaffRoute = ({ children }: StaffRouteProps) => {
  const isStaff = localStorage.getItem('userRole') === 'staff';
  return isStaff ? <>{children}</> : <Navigate to="/auth/login" replace />;
};

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* Route dành cho người dùng */}
        <Route path="/" element={<UserLayout />}>
          <Route index element={<Home />} />
          <Route path="/auth" element={<Navigate to="/auth/login" replace />} />
          <Route path="auth/login" element={<Login />} />
          <Route path="auth/register" element={<Register />} />
          <Route path="auth/verify-otp" element={<VerifyOTP />} />
          <Route path="booking" element={<Booking />} />
          <Route path="services" element={<Services />} />
          <Route path="blogUser" element={<UserBlog />} />
          <Route path="/blog/:id" element={<BlogDetail />} />
          <Route path="CycleTracker" element={<CycleTracker />} />
          <Route path="profile" element={<Profile />} />
          <Route path="confirm-booking" element={<ConfirmBooking />} />
          <Route path="payment" element={<Payment />} />
          <Route path="payment-success" element={<PaymentSuccess />} />
          <Route path="contact" element={<Contact />} />
          <Route path="test-results/:id" element={<TestResults />} />
          <Route path="qna" element={<QnA />} />
        </Route>

        {/* Route dành cho consultant */}
        <Route path="/consultant" element={
          <ConsultantRoute>
            <ConsultantLayout />
          </ConsultantRoute>
        }>
          <Route index element={<ConsultantDashboard />} />
          <Route path="dashboard" element={<ConsultantDashboard />} />
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
          <Route index element={<ManagerDashboard />} />
          <Route path="services" element={<ServiceManagement />} />
          <Route path="blogs" element={<BlogManagement />} />
          <Route path="slots" element={<SlotManagement />} />
          <Route path="create-slots" element={<SlotCreation />} />
        </Route>

        {/* Route dành cho staff */}
        <Route path="/staff" element={
          <StaffRoute>
            <StaffLayout />
          </StaffRoute>
        }>
          <Route index element={<StaffDashboard />} />
          <Route path="dashboard" element={<StaffDashboard />} />
          <Route path="appointments" element={<StaffAppointments />} />
          <Route path="test-results/:id" element={<TestResultView />} />
          <Route path="test-result-input/:appointmentId" element={<TestResultInput />} />
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
        </Route>
      </Routes>
    </Router>
  );
}

export default App;