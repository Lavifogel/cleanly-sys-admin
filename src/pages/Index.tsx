
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const Index = () => {
  const navigate = useNavigate();
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"admin" | "cleaner" | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
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

  const handleRoleClick = (role: "admin" | "cleaner") => {
    setSelectedRole(role);
    setAuthDialogOpen(true);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Please enter both email and password");
      return;
    }

    setIsLoading(true);
    
    try {
      if (isSignUp) {
        // Sign up flow
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              role: selectedRole
            }
          }
        });

        if (error) throw error;

        if (data.user) {
          // Insert into profiles table
          const { error: profileError } = await supabase
            .from('profiles')
            .insert([
              {
                id: data.user.id,
                role: selectedRole,
                email
              }
            ]);

          if (profileError) throw profileError;
          
          toast.success("Account created successfully");
          
          // Sign in automatically
          await supabase.auth.signInWithPassword({
            email,
            password
          });
          
          if (selectedRole === 'admin') {
            navigate('/admin/dashboard');
          } else {
            navigate('/cleaners/dashboard');
          }
        }
      } else {
        // Sign in flow
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) throw error;
        
        toast.success("Signed in successfully");
        setAuthDialogOpen(false);
        
        // Redirect happens through the useEffect
      }
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(`Authentication error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAccess = async (role: "admin" | "cleaner") => {
    const email = role === "admin" ? "admin@example.com" : "cleaner@example.com";
    const password = role === "admin" ? "admin123" : "cleaner123";
    
    setIsLoading(true);
    
    try {
      // Sign in with predefined credentials
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        // If signing in fails, try to create the account
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              role
            }
          }
        });

        if (signUpError) throw signUpError;

        if (data.user) {
          // Insert into profiles table
          const { error: profileError } = await supabase
            .from('profiles')
            .insert([
              {
                id: data.user.id,
                role,
                email
              }
            ]);

          if (profileError) throw profileError;
          
          // Sign in after creating account
          await supabase.auth.signInWithPassword({
            email,
            password
          });
        }
      }

      // Navigate to dashboard
      navigate(role === 'admin' ? '/admin/dashboard' : '/cleaners/dashboard');
      toast.success(`Signed in as ${role === 'admin' ? 'Admin' : 'Cleaner'}`);
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(`Authentication error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
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
              <div className="space-y-4">
                <Button 
                  size="lg" 
                  className="rounded-full px-8 py-6 shadow-md w-full sm:w-auto"
                  onClick={() => handleRoleClick("admin")}
                >
                  Login as Admin
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="rounded-full px-8 py-6 w-full sm:w-auto"
                  onClick={() => handleRoleClick("cleaner")}
                >
                  Login as Cleaner
                </Button>
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-200 sm:border-t-0 sm:border-l sm:pl-6 sm:mt-0 sm:pt-0">
                <p className="mb-2 text-sm text-muted-foreground">Quick Access:</p>
                <div className="flex flex-col gap-2">
                  <Button 
                    variant="secondary" 
                    size="sm"
                    className="text-xs"
                    onClick={() => handleQuickAccess("admin")}
                    disabled={isLoading}
                  >
                    Demo as Admin
                  </Button>
                  <Button 
                    variant="secondary" 
                    size="sm"
                    className="text-xs"
                    onClick={() => handleQuickAccess("cleaner")}
                    disabled={isLoading}
                  >
                    Demo as Cleaner
                  </Button>
                </div>
              </div>
            </>
          ) : null}
        </motion.div>
      </motion.div>
      
      {/* Authentication Dialog */}
      <Dialog open={authDialogOpen} onOpenChange={setAuthDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isSignUp ? "Create a new account" : "Sign in to your account"}
              {selectedRole ? ` as ${selectedRole}` : ""}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSignIn} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            <div className="flex justify-between items-center pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsSignUp(!isSignUp)}
              >
                {isSignUp ? "Have an account? Sign in" : "Need an account? Sign up"}
              </Button>
              
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Processing..." : isSignUp ? "Sign Up" : "Sign In"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
