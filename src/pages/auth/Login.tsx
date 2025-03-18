
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import Logo from "@/components/ui/logo";
import { useUserData } from "@/hooks/useUserData";

const Login = () => {
  const [countryCode, setCountryCode] = useState("+123");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { loginWithCredentials } = useUserData();

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
      const { success, error, user } = await loginWithCredentials(fullPhoneNumber, password);
      
      if (success && user) {
        toast({
          title: "Success",
          description: "Logged in successfully",
        });
        
        // Redirect based on user role
        if (user.role === 'admin') {
          navigate("/admin/dashboard");
        } else if (user.role === 'cleaner') {
          navigate("/cleaners/dashboard");
        }
      } else {
        throw new Error(error instanceof Error ? error.message : "Invalid phone number or password");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to log in",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 flex flex-col items-center">
          <Logo className="h-12 w-auto mb-4" />
          <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
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
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
              />
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
