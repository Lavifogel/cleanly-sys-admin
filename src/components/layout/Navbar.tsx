
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import NavbarRoutes from "./NavbarRoutes";
import MobileMenu from "./MobileMenu";

import {
  Check,
  Menu,
  X
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { getNavRoutes } from "@/utils/navbarUtils";
import Logo from "@/components/ui/logo";
import ProfileButton from "@/components/layout/ProfileButton";
import { motion } from "framer-motion";
import { useNavbar } from "@/hooks/useNavbar";
import { useUserData } from "@/hooks/useUserData";

const Navbar = () => {
  const { isScrolled, isMobileMenuOpen, setIsMobileMenuOpen, userRole, userName, location, navigate, session, isLoginPage, isIndexPage, isAdminPage, shouldHideProfileIcon } = useNavbar();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { session: userData, userRole: role } = useUserData();

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };
  
  // Get routes based on user role
  const routes = getNavRoutes(userData, role);
  
  // Function to check if a route is active
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Close mobile menu when location changes
  useEffect(() => {
    setShowMobileMenu(false);
  }, [location]);
  
  // Check if we're on the index page
  const isIndex = location.pathname === "/";
  const isAdminDashboard = location.pathname.includes("/admin/dashboard");
  const isCleanerDashboard = location.pathname.includes("/cleaners/dashboard") || location.pathname.includes("/cleaners/welcome");
  
  // If not on index, determine the app context for the header text
  let appContext = "";
  
  if (isAdminDashboard) {
    appContext = "Admin Portal";
  } else if (isCleanerDashboard) {
    appContext = "CleanersCheck";
  }

  // Show the logo on navbar
  const showLogo = isIndex || isAdminDashboard;
  
  // Special styling for cleaners dashboard
  const isCleanersApp = location.pathname.includes("/cleaners");
  
  return (
    <motion.div 
      className={cn(
        "fixed top-0 left-0 right-0 border-b z-50 bg-background shadow-sm",
        isCleanersApp && "bg-white"
      )}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center h-20 px-4 md:px-6 justify-between">
        {/* Left side of navbar */}
        <div className="flex items-center gap-3">
          {showLogo && (
            <Logo className="w-10 h-10" />
          )}
          
          {isCleanersApp && (
            <div className="flex items-center gap-2">
              <div className="bg-primary rounded-full p-2">
                <Check className="h-5 w-5 text-white" />
              </div>
              <span className="text-primary text-xl font-semibold">
                {appContext}
              </span>
            </div>
          )}
          
          {!isCleanersApp && appContext && (
            <div className="text-xl font-medium">
              {appContext}
            </div>
          )}
        </div>
        
        {/* Desktop Nav Links */}
        <div className="hidden md:flex">
          <NavbarRoutes routes={routes} isActive={isActive} className="flex space-x-1" />
        </div>
        
        {/* Right side of navbar */}
        <div className="flex items-center gap-3">
          {/* Show profile button when logged in */}
          {session && (
            <ProfileButton onClick={() => console.log("Profile clicked")} />
          )}
          
          {/* Mobile menu toggle */}
          {(routes.length > 0 || session) && (
            <div className="md:hidden">
              <Button variant="outline" size="icon" onClick={toggleMobileMenu}>
                {showMobileMenu ? <X /> : <Menu />}
              </Button>
            </div>
          )}
        </div>
      </div>
      
      {/* Mobile menu */}
      {showMobileMenu && (
        <MobileMenu isOpen={showMobileMenu} routes={routes} isActive={isActive} />
      )}
    </motion.div>
  );
};

export default Navbar;
