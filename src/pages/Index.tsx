import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ShieldCheck, Users } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  const handleAdminClick = () => {
    navigate('/admin/dashboard');
  };

  const handleCleanerClick = () => {
    navigate('/cleaners/dashboard');
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex flex-col items-center justify-center px-6">
      <motion.div 
        className="text-center max-w-3xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div 
          className="inline-block mb-4 px-4 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          Welcome to CleanersCheck
        </motion.div>
        
        <motion.h1 
          className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          Smart Cleaning Management
        </motion.h1>
        
        <motion.p 
          className="text-lg text-muted-foreground mb-10 leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          Simplify your cleaning operations with our intuitive platform.
          Track tasks, manage schedules, and improve efficiency all in one place.
        </motion.p>
        
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 text-left"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <div className="flex flex-col bg-card/50 p-6 rounded-xl border border-border/50">
            <div className="flex justify-between items-start mb-4">
              <div className="rounded-full bg-primary/10 w-10 h-10 flex items-center justify-center">
                <ShieldCheck className="h-5 w-5 text-primary" />
              </div>
              <Button 
                size="sm" 
                className="rounded-full shadow-md group"
                onClick={handleAdminClick}
              >
                Admin Portal
                <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
            <h3 className="text-xl font-semibold mb-2">Admin Portal</h3>
            <p className="text-muted-foreground">Manage cleaning teams, track performance, and optimize workflows from a central dashboard.</p>
          </div>
          
          <div className="flex flex-col bg-card/50 p-6 rounded-xl border border-border/50">
            <div className="flex justify-between items-start mb-4">
              <div className="rounded-full bg-primary/10 w-10 h-10 flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <Button 
                size="sm" 
                variant="outline" 
                className="rounded-full group"
                onClick={handleCleanerClick}
              >
                Cleaner Portal
                <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
            <h3 className="text-xl font-semibold mb-2">Cleaner Interface</h3>
            <p className="text-muted-foreground">View assignments, track completed tasks, and manage your cleaning schedule with ease.</p>
          </div>
        </motion.div>
        
        <motion.div 
          className="flex flex-col sm:flex-row gap-4 justify-center md:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          <Button 
            size="lg" 
            className="rounded-full px-8 py-6 shadow-md w-full sm:w-auto group"
            onClick={handleAdminClick}
          >
            Admin Portal
            <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="rounded-full px-8 py-6 w-full sm:w-auto group"
            onClick={handleCleanerClick}
          >
            Cleaner Portal
            <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Index;
