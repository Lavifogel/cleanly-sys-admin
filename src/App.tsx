
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense, createContext, useContext } from "react";
import { AnimatePresence } from "framer-motion";
import Navbar from "./components/layout/Navbar";
import { useUserData } from "./hooks/useUserData";

// Pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/auth/Login";

const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const CleanersDashboard = lazy(() => import("./pages/cleaners/Dashboard"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Create auth context for protected routes
const AuthContext = createContext<ReturnType<typeof useUserData> | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Protected route component that checks specific roles
const RoleProtectedRoute = ({ 
  children, 
  allowedRoles 
}: { 
  children: React.ReactNode, 
  allowedRoles: string[] 
}) => {
  const { isAuthenticated, userRole } = useAuth();
  
  if (!isAuthenticated || !userRole || !allowedRoles.includes(userRole)) {
    // Redirect to login if not authenticated or not allowed
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// Auth Provider component
const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const userData = useUserData();
  
  return (
    <AuthContext.Provider value={userData}>
      {children}
    </AuthContext.Provider>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Navbar />
          <main className="pt-20">
            <AnimatePresence mode="wait">
              <Suspense fallback={
                <div className="flex items-center justify-center min-h-[calc(100vh-5rem)]">
                  <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                </div>
              }>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/login" element={<Login />} />
                  <Route 
                    path="/admin/dashboard" 
                    element={
                      <RoleProtectedRoute allowedRoles={['admin']}>
                        <AdminDashboard />
                      </RoleProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/cleaners/dashboard" 
                    element={
                      <RoleProtectedRoute allowedRoles={['cleaner']}>
                        <CleanersDashboard />
                      </RoleProtectedRoute>
                    } 
                  />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </AnimatePresence>
          </main>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
