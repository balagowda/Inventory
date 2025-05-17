// components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';

const ProtectedAdminRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
  if (!token || role !== 'ADMIN') {
    return <Navigate to="/404" replace />;
  }

  return children;
};

export default ProtectedAdminRoute;
