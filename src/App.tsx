
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Index from './pages/Index';
import Dashboard from './pages/admin/Dashboard';
import CleanerDashboard from './pages/cleaners/Dashboard';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import './App.css';

// Protected route component that checks for authentication
const ProtectedRoute = ({ children, requiredRole = null }: { children: JSX.Element, requiredRole?: string | null }) => {
  const { isAuthenticated, userRole, loading } = useAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (requiredRole && userRole !== requiredRole) {
    // Redirect to appropriate dashboard based on role
    return <Navigate to={userRole === 'admin' ? '/admin/dashboard' : '/cleaners/dashboard'} replace />;
  }
  
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          
          {/* Protected admin routes */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute requiredRole="admin">
              <Dashboard />
            </ProtectedRoute>
          } />
          
          {/* Protected cleaner routes */}
          <Route path="/cleaners/dashboard" element={
            <ProtectedRoute requiredRole="cleaner">
              <CleanerDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
