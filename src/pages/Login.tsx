
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";

const Login = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [activationCode, setActivationCode] = useState("");
  const [showActivation, setShowActivation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, activateAccount } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phoneNumber || !password) return;
    
    setIsLoading(true);
    
    try {
      const success = await login(phoneNumber, password);
      
      if (success) {
        navigate("/");
      } else {
        // Check if it's a first-time login
        setShowActivation(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleActivation = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phoneNumber || !activationCode) return;
    
    setIsLoading(true);
    
    try {
      const success = await activateAccount(phoneNumber, activationCode);
      
      if (success) {
        navigate("/");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Cleaning App</h1>
          <p className="text-gray-500 mt-2">Sign in to your account</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>
                {showActivation ? "Activate Your Account" : "Login"}
              </CardTitle>
              <CardDescription>
                {showActivation 
                  ? "Enter the activation code provided by your administrator"
                  : "Enter your phone number and password"}
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {!showActivation ? (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Phone Number</Label>
                    <Input
                      id="phoneNumber"
                      type="text"
                      placeholder="+1234567890"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="********"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleActivation} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="activationCode">Activation Code</Label>
                    <Input
                      id="activationCode"
                      type="text" 
                      placeholder="Enter 6-digit code"
                      value={activationCode}
                      onChange={(e) => setActivationCode(e.target.value)}
                      required
                    />
                  </div>
                  
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Activating..." : "Activate Account"}
                  </Button>
                  
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setShowActivation(false)}
                    disabled={isLoading}
                  >
                    Back to Login
                  </Button>
                </form>
              )}
            </CardContent>
            
            <CardFooter className="flex flex-col text-center text-sm text-gray-500">
              <p>If you need assistance, please contact your administrator.</p>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
