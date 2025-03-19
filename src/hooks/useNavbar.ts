
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useUserData } from '@/hooks/useUserData';

export const useNavbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { userRole, userName, session, isAuthenticated } = useUserData();

  // Check if current page is login or index page
  const isLoginPage = location.pathname === '/login';
  const isIndexPage = location.pathname === '/';
  const isAdminPage = location.pathname.includes('/admin');
  const shouldHideProfileIcon = isLoginPage || isIndexPage || isAdminPage || userRole === 'admin' || !isAuthenticated;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  // Set up event listener for the "set-home-tab" event
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
    isScrolled,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    userRole,
    userName,
    location,
    navigate,
    session,
    isLoginPage,
    isIndexPage,
    isAdminPage,
    shouldHideProfileIcon,
    isAuthenticated
  };
};
