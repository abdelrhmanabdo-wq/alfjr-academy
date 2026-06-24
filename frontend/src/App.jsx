import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'

// Layouts
import DashboardLayout from './layouts/DashboardLayout'

// Auth Pages
import LoginPage from './pages/auth/LoginPage'
import SetupPage from './pages/auth/SetupPage'

// Dashboard Pages
import AdminDashboard from './pages/dashboard/AdminDashboard'
import SupervisorDashboard from './pages/dashboard/SupervisorDashboard'
import TeacherDashboard from './pages/dashboard/TeacherDashboard'

// Student/Parent Pages
import ParentsPage from './pages/parents/ParentsPage'
import StudentsPage from './pages/students/StudentsPage'

// Teacher Pages
import TeachersPage from './pages/teachers/TeachersPage'

// Session Pages
import SessionsPage from './pages/sessions/SessionsPage'
import CalendarPage from './pages/sessions/CalendarPage'

// Financial Pages
import InvoicesPage from './pages/invoices/InvoicesPage'
import PaymentsPage from './pages/payments/PaymentsPage'
import PayrollPage from './pages/payroll/PayrollPage'
import ExchangeRatesPage from './pages/finance/ExchangeRatesPage'

// CRM
import LeadsPage from './pages/leads/LeadsPage'

// Reports
import ReportsPage from './pages/reports/ReportsPage'

const PrivateRoute = ({ children, roles }) => {
  const { user, token } = useAuthStore()
  if (!token || !user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />
  return children
}

export default function App() {
  const { user } = useAuthStore()

  const getDashboard = () => {
    if (!user) return <Navigate to="/login" replace />
    if (user.role === 'ADMIN' || user.role === 'HEAD_SUPERVISOR') return <AdminDashboard />
    if (user.role === 'SUPERVISOR') return <SupervisorDashboard />
    return <TeacherDashboard />
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/setup" element={<SetupPage />} />

      <Route path="/" element={
        <PrivateRoute>
          <DashboardLayout />
        </PrivateRoute>
      }>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={getDashboard()} />
        <Route path="parents" element={<PrivateRoute roles={['ADMIN','HEAD_SUPERVISOR','SUPERVISOR']}><ParentsPage /></PrivateRoute>} />
        <Route path="students" element={<PrivateRoute roles={['ADMIN','HEAD_SUPERVISOR','SUPERVISOR']}><StudentsPage /></PrivateRoute>} />
        <Route path="teachers" element={<PrivateRoute roles={['ADMIN','HEAD_SUPERVISOR','SUPERVISOR']}><TeachersPage /></PrivateRoute>} />
        <Route path="sessions" element={<SessionsPage />} />
        <Route path="calendar" element={<CalendarPage />} />
        <Route path="invoices" element={<PrivateRoute roles={['ADMIN']}><InvoicesPage /></PrivateRoute>} />
        <Route path="payments" element={<PrivateRoute roles={['ADMIN']}><PaymentsPage /></PrivateRoute>} />
        <Route path="payroll" element={<PrivateRoute roles={['ADMIN']}><PayrollPage /></PrivateRoute>} />
        <Route path="exchange-rates" element={<PrivateRoute roles={['ADMIN']}><ExchangeRatesPage /></PrivateRoute>} />
        <Route path="leads" element={<PrivateRoute roles={['ADMIN','HEAD_SUPERVISOR','SUPERVISOR']}><LeadsPage /></PrivateRoute>} />
        <Route path="reports" element={<PrivateRoute roles={['ADMIN']}><ReportsPage /></PrivateRoute>} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
