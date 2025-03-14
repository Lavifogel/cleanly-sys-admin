
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useNavbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userRole, setUserRole] = useState<string | null>('cleaner'); // Default to cleaner for Lavi
  const [userName, setUserName] = useState<string | null>("Lavi Fogel"); // Default to Lavi Fogel
  const location = useLocation();
  const navigate = useNavigate();

  // Check if current page is login or index page
  const isLoginPage = location.pathname === '/login';
  const isIndexPage = location.pathname === '/';
  const isAdminPage = location.pathname.includes('/admin');
  const shouldHideProfileIcon = isLoginPage || isIndexPage || isAdminPage || userRole === 'admin';

  // Fetch user session and role
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
        const { data, error } = await supabase
          .from('users')
          .select('role, first_name, last_name')
          .eq('id', session.user.id)
          .single();
        
        if (data) {
          setUserRole(data.role);
          if (data.first_name && data.last_name) {
            setUserName(`${data.first_name} ${data.last_name}`);
          }
        } else {
          setUserRole('cleaner'); // Fallback to cleaner (for Lavi)
          setUserName("Lavi Fogel"); // Set name for Lavi
        }
      } else {
        // When not authenticated, use Lavi's defaults
        setUserRole('cleaner');
        setUserName("Lavi Fogel");
      }
    };

    fetchUserProfile();
  }, [session]);

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
    shouldHideProfileIcon
  };
};
