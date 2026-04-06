import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import EmployeePortal from './pages/EmployeePortal'
import Trash from './pages/Trash'
import AddEmployee from './pages/AddEmployee'
import PayrollStatus from './pages/PayrollStatus'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/add-employee" element={<AddEmployee />} />
        <Route path="/status/:type" element={<PayrollStatus />} />
        <Route path="/portal" element={<EmployeePortal />} />
        <Route path="/trash" element={<Trash />} />
      </Routes>
    </Router>
  )
}

export default App
