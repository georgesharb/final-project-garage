import { Navigate } from 'react-router-dom';
import { getUser } from '../api';

// Shows the page only if the user is logged in with the right role.
export default function ProtectedRoute({ role, children }) {
  const user = getUser();

  if (!user || user.role !== role) {
    return <Navigate to="/login" />;
  }
  return children;
}
