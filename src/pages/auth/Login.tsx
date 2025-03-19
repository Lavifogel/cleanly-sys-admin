
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import Logo from "@/components/ui/logo";
import { useUserData } from "@/hooks/useUserData";
import { Eye, EyeOff } from "lucide-react";

const Login = () => {
  const [countryCode, setCountryCode] = useState("+972");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { login, isAuthenticated, userRole } = useUserData();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      console.log("User already authenticated with role:", userRole);
      if (userRole === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else if (userRole === 'cleaner') {
        navigate('/cleaners/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, userRole, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!countryCode || !phoneNumber || !password) {
      toast({
        title: "Error",
        description: "Please enter country code, phone number and password",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const fullPhoneNumber = `${countryCode}${phoneNumber}`;
      console.log("Attempting login with:", fullPhoneNumber);
      
      const userData = await login(fullPhoneNumber, password);
      
      if (userData) {
        toast({
          title: "Success",
          description: "Logged in successfully",
        });
        
        // Log the user data to see what we get back
        console.log("User data after login:", userData);
        
        // Explicitly check role and navigate accordingly
        if (userData.role === 'admin') {
          console.log("Redirecting admin to dashboard");
          navigate('/admin/dashboard', { replace: true });
        } else if (userData.role === 'cleaner') {
          console.log("Redirecting cleaner to dashboard");
          navigate('/cleaners/dashboard', { replace: true });
        } else {
          console.warn("Unknown role:", userData.role);
          navigate('/', { replace: true });
        }
      } else {
        throw new Error("Invalid phone number or password");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to log in",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 flex flex-col items-center">
          <Logo className="h-12 w-auto mb-4" />
          <CardTitle className="text-2xl font-bold">Welcome</CardTitle>
          <CardDescription>
            Sign in to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <div className="flex gap-2">
                <Input
                  id="countryCode"
                  placeholder="+972"
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="w-24"
                  autoComplete="tel-country-code"
                />
                <Input
                  id="phoneNumber"
                  placeholder="Phone number without country code"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="flex-1"
                  autoComplete="tel-national"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-500">
            Contact admin if you need assistance
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
