
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUserData } from "@/hooks/useUserData";
import { Button } from "@/components/ui/button";
import Logo from "@/components/ui/logo";

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useUserData();

  useEffect(() => {
    // If user is already authenticated, redirect to cleaner dashboard
    if (isAuthenticated) {
      navigate("/cleaners/dashboard");
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-5rem)] p-4 text-center">
      <Logo className="h-24 w-auto mb-6" />
      
      <h1 className="text-4xl font-bold tracking-tight mb-4">
        Welcome to our Cleaning Management System
      </h1>
      
      <p className="text-xl text-gray-600 mb-8 max-w-3xl">
        A comprehensive platform for cleaners to manage their shifts and cleaning activities
      </p>
      
      <div className="flex flex-wrap justify-center gap-4">
        <Button 
          size="lg" 
          onClick={() => navigate("/login")}
          className="text-lg"
        >
          Sign In
        </Button>
      </div>
    </div>
  );
};

export default Index;
