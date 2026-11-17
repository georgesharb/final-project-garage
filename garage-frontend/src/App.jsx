import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import OwnerSetup from './pages/OwnerSetup';

import Dashboard from './pages/owner/Dashboard';
import Search from './pages/owner/Search';
import Clients from './pages/owner/Clients';
import ClientDetails from './pages/owner/ClientDetails';
import Cars from './pages/owner/Cars';
import Repairs from './pages/owner/Repairs';
import Appointments from './pages/owner/Appointments';

import Profile from './pages/client/Profile';
import MyCars from './pages/client/MyCars';
import MyAppointments from './pages/client/MyAppointments';

const ownerLinks = [
  { to: '/owner', label: 'Dashboard' },
  { to: '/owner/search', label: 'Search' },
  { to: '/owner/clients', label: 'Clients' },
  { to: '/owner/cars', label: 'Cars' },
  { to: '/owner/repairs', label: 'Repairs' },
  { to: '/owner/appointments', label: 'Appointments' }
];

const clientLinks = [
  { to: '/client', label: 'My profile' },
  { to: '/client/cars', label: 'My cars' },
  { to: '/client/appointments', label: 'Appointments' }
];

export default function App() {
  return (
    <Routes>
      {/* Public pages */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/setup" element={<OwnerSetup />} />

      {/* Owner pages: only for role "owner" */}
      <Route
        path="/owner"
        element={
          <ProtectedRoute role="owner">
            <Layout title="Owner panel" links={ownerLinks} />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="search" element={<Search />} />
        <Route path="clients" element={<Clients />} />
        <Route path="clients/:id" element={<ClientDetails />} />
        <Route path="cars" element={<Cars />} />
        <Route path="repairs" element={<Repairs />} />
        <Route path="appointments" element={<Appointments />} />
      </Route>

      {/* Client pages: only for role "client" */}
      <Route
        path="/client"
        element={
          <ProtectedRoute role="client">
            <Layout title="My garage" links={clientLinks} />
          </ProtectedRoute>
        }
      >
        <Route index element={<Profile />} />
        <Route path="cars" element={<MyCars />} />
        <Route path="appointments" element={<MyAppointments />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}
