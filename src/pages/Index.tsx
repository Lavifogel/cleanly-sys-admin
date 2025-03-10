
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();
  
  // Fetch user session and role
  const { data: session } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
  });

  // Redirect authenticated users to their respective dashboards
  useEffect(() => {
    const redirectUser = async () => {
      if (session?.user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
        
        if (profileData?.role === 'admin') {
          navigate('/admin/dashboard');
        } else if (profileData?.role === 'cleaner') {
          navigate('/cleaners/dashboard');
        }
      }
    };

    redirectUser();
  }, [session, navigate]);

  const handleAdminClick = () => {
    // Direct login redirect to admin dashboard
    navigate('/admin/dashboard');
  };

  const handleCleanerClick = () => {
    // Direct login redirect to cleaner dashboard
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
          {!session ? (
            <>
              <Button 
                size="lg" 
                className="rounded-full px-8 py-6 shadow-md"
                onClick={handleAdminClick}
              >
                Admin
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="rounded-full px-8 py-6"
                onClick={handleCleanerClick}
              >
                Cleaners
              </Button>
            </>
          ) : null}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Index;
