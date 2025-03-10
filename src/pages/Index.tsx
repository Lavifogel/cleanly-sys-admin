
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";

const Index = () => {
  const [userRole, setUserRole] = useState<string | null>(null);

  // Fetch user session
  const { data: session } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
  });

  // Fetch user profile to get role
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (session?.user) {
        const { data } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
        
        if (data) {
          setUserRole(data.role);
        }
      } else {
        setUserRole(null);
      }
    };

    fetchUserProfile();
  }, [session]);

  // Determine dashboard link based on user role
  const getDashboardLink = () => {
    if (!session) {
      return null;
    }

    if (userRole === 'admin') {
      return '/admin/dashboard';
    } else if (userRole === 'cleaner') {
      return '/cleaners/dashboard';
    }

    return null;
  };

  const dashboardLink = getDashboardLink();

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
          Cleaning Management System
        </motion.div>
        
        <motion.h1 
          className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          Streamlined Cleaning Operations
        </motion.h1>
        
        <motion.p 
          className="text-lg text-muted-foreground mb-10 leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          An elegantly designed system for managing cleaning departments with
          intuitive interfaces for both cleaners and administrators.
        </motion.p>
        
        <motion.div 
          className="flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          {session ? (
            <Button asChild size="lg" className="rounded-full px-8 py-6 shadow-md">
              <Link to={dashboardLink || '/'}>Go to Dashboard</Link>
            </Button>
          ) : (
            <>
              <Button asChild size="lg" className="rounded-full px-8 py-6 shadow-md">
                <Link to="/admin/dashboard">Admin Dashboard</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full px-8 py-6">
                <Link to="/cleaners/dashboard">Cleaners Dashboard</Link>
              </Button>
            </>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Index;
