
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useUserData } from '@/hooks/useUserData';

/**
 * Hook for managing navbar state and behavior
 */
export const useNavbar = () => {
  // UI State
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Router hooks
  const location = useLocation();
  const navigate = useNavigate();
  
  // User data
  const { userRole, userName, isAuthenticated } = useUserData();

  // Derived state for conditional rendering
  const isLoginPage = location.pathname === '/login';
  const isIndexPage = location.pathname === '/';
  const isAdminPage = location.pathname.includes('/admin');
  const shouldHideProfileIcon = isLoginPage || isIndexPage || isAdminPage || userRole === 'admin' || !isAuthenticated;

  // Handle scroll events
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  // Custom event handler for tab management
  useEffect(() => {
    const handleSetHomeTab = () => {
      const event = new CustomEvent('set-active-tab', { detail: 'home' });
      window.dispatchEvent(event);
    };

    window.addEventListener('set-home-tab', handleSetHomeTab);
    
    return () => {
      window.removeEventListener('set-home-tab', handleSetHomeTab);
    };
  }, []);

  return {
    // UI state
    isScrolled,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    
    // User info
    userRole,
    userName,
    isAuthenticated,
    
    // Navigation
    location,
    navigate,
    
    // Page info
    isLoginPage,
    isIndexPage,
    isAdminPage,
    shouldHideProfileIcon
  };
};
