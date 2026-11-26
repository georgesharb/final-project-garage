import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Public pages: loaded right away (everyone sees them)
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';

// Owner and client pages: loaded only when someone opens them (lazy),
// so a visitor of the main page downloads less JavaScript.
const Dashboard = lazy(() => import('./pages/owner/Dashboard'));
const Search = lazy(() => import('./pages/owner/Search'));
const Clients = lazy(() => import('./pages/owner/Clients'));
const ClientDetails = lazy(() => import('./pages/owner/ClientDetails'));
const Cars = lazy(() => import('./pages/owner/Cars'));
const Repairs = lazy(() => import('./pages/owner/Repairs'));
const Appointments = lazy(() => import('./pages/owner/Appointments'));
const Bin = lazy(() => import('./pages/owner/Bin'));
const ClientHome = lazy(() => import('./pages/client/ClientHome'));

const ownerLinks = [
  { to: '/owner', label: 'Dashboard' },
  { to: '/owner/search', label: 'Search' },
  { to: '/owner/clients', label: 'Clients' },
  { to: '/owner/cars', label: 'Cars' },
  { to: '/owner/repairs', label: 'Repairs' },
  { to: '/owner/appointments', label: 'Appointments' },
  { to: '/owner/bin', label: '🗑 Bin' }
];

export default function App() {
  return (
    // Suspense shows "Loading..." while a lazy page is downloading
    <Suspense fallback={<p className="client-content">Loading...</p>}>
      <Routes>
        {/* Public pages */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

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
          <Route path="bin" element={<Bin />} />
        </Route>

        {/* Client: ONE home page, only for role "client" */}
        <Route
          path="/client"
          element={
            <ProtectedRoute role="client">
              <ClientHome />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Suspense>
  );
}
