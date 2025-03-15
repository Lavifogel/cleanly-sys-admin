
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { AnimatePresence } from "framer-motion";
import Navbar from "./components/layout/Navbar";

// Pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const CleanersDashboard = lazy(() => import("./pages/cleaners/Dashboard"));
const CleanersWelcome = lazy(() => import("./pages/cleaners/Welcome"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Navbar />
        <main>
          <AnimatePresence mode="wait">
            <Suspense fallback={
              <div className="flex items-center justify-center min-h-[calc(100vh-5rem)]">
                <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
              </div>
            }>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/cleaners/welcome" element={<CleanersWelcome />} />
                <Route path="/cleaners/dashboard" element={<CleanersDashboard />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </AnimatePresence>
        </main>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
