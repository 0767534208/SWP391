import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Home from './components/Home'
import Login from './pages/Auth/Login'
import Register from './pages/Auth/Register'
import Booking from './pages/Booking/Booking'
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Navigate to="/auth/login" replace />} />
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/register" element={<Register />} />
        <Route path="/booking" element={<Booking />} />
      </Routes>
    </Router>
  )
}

export default App
