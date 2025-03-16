
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useUserData = () => {
  const [userRole, setUserRole] = useState<string | null>('cleaner'); // Default to cleaner for Lavi
  const [userName, setUserName] = useState<string | null>("Lavi Fogel"); // Default to Lavi Fogel

  // Fetch user session
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

  return {
    userRole,
    userName,
    session
  };
};
