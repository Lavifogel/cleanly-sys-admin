
import { useMemo } from 'react';

export interface NavRoute {
  path: string;
  label: string;
}

// Cached route arrays to prevent recreating on each call
const EMPTY_ROUTES: NavRoute[] = [];
const ADMIN_ROUTES: NavRoute[] = [];
const CLEANER_ROUTES: NavRoute[] = [];

export const getNavRoutes = (session: any, userRole: string | null): NavRoute[] => {
  // If user is not logged in, don't show any routes
  if (!session) {
    return EMPTY_ROUTES;
  }

  // If user is logged in, only show their relevant dashboard
  if (userRole === 'admin') {
    // Return empty array for admin - removing the Dashboard button
    return ADMIN_ROUTES;
  } else if (userRole === 'cleaner') {
    // Return empty array for cleaner - removing the Dashboard button
    return CLEANER_ROUTES;
  }

  return EMPTY_ROUTES;
};

// Create a custom hook to memoize nav routes
export const useNavRoutes = (session: any, userRole: string | null): NavRoute[] => {
  return useMemo(() => getNavRoutes(session, userRole), [session, userRole]);
};
