import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import Layout from './Layout';
import LoginPage from './LoginPage';
import DoctorsPage from './DoctorsPage';
import MyBookingsPage from './MyBookingsPage';
import DoctorPage from './DoctorPage';

const PATIENT_LINKS = [
  { to: '/patient',          icon: '🩺', label: 'Tìm bác sĩ' },
  { to: '/patient/bookings', icon: '📋', label: 'Lịch của tôi' },
];
const DOCTOR_LINKS = [
  { to: '/doctor', icon: '📅', label: 'Lịch khám' },
];

function PrivateRoute({ children, role }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" />;
  if (role && user.role !== role) return <Navigate to="/" />;
  return children;
}

function PatientLayout({ children }) {
  return <Layout links={PATIENT_LINKS}>{children}</Layout>;
}
function DoctorLayout({ children }) {
  return <Layout links={DOCTOR_LINKS}>{children}</Layout>;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginPage />} />

          <Route path="/patient" element={
            <PrivateRoute role="PATIENT">
              <PatientLayout><DoctorsPage /></PatientLayout>
            </PrivateRoute>
          } />
          <Route path="/patient/bookings" element={
            <PrivateRoute role="PATIENT">
              <PatientLayout><MyBookingsPage /></PatientLayout>
            </PrivateRoute>
          } />

          <Route path="/doctor" element={
            <PrivateRoute role="DOCTOR">
              <DoctorLayout><DoctorPage /></DoctorLayout>
            </PrivateRoute>
          } />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}