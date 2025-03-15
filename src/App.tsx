
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import { AnimatePresence } from "framer-motion";
import Navbar from "./components/layout/Navbar";
import { AuthProvider } from "./contexts/AuthContext";
import AuthGuard from "./components/auth/AuthGuard";
import Login from "./pages/Login";

// Pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const CleanersDashboard = lazy(() => import("./pages/cleaners/Dashboard"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route element={<AuthGuard />}>
              <Route path="/" element={
                <>
                  <Navbar />
                  <main className="pt-20">
                    <AnimatePresence mode="wait">
                      <Suspense fallback={
                        <div className="flex items-center justify-center min-h-[calc(100vh-5rem)]">
                          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                        </div>
                      }>
                        <Index />
                      </Suspense>
                    </AnimatePresence>
                  </main>
                </>
              } />
              
              <Route path="/admin/dashboard" element={
                <>
                  <Navbar />
                  <main className="pt-20">
                    <AnimatePresence mode="wait">
                      <Suspense fallback={
                        <div className="flex items-center justify-center min-h-[calc(100vh-5rem)]">
                          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                        </div>
                      }>
                        <AdminDashboard />
                      </Suspense>
                    </AnimatePresence>
                  </main>
                </>
              } />
              
              <Route path="/cleaners/dashboard" element={
                <>
                  <Navbar />
                  <main className="pt-20">
                    <AnimatePresence mode="wait">
                      <Suspense fallback={
                        <div className="flex items-center justify-center min-h-[calc(100vh-5rem)]">
                          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                        </div>
                      }>
                        <CleanersDashboard />
                      </Suspense>
                    </AnimatePresence>
                  </main>
                </>
              } />
              
              <Route path="*" element={
                <>
                  <Navbar />
                  <main className="pt-20">
                    <NotFound />
                  </main>
                </>
              } />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
