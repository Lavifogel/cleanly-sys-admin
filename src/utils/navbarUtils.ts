
export interface NavRoute {
  path: string;
  label: string;
}

export const getNavRoutes = (session: any, userRole: string | null): NavRoute[] => {
  // If user is not logged in, don't show any routes
  if (!session) {
    // Return empty array - no navigation items
    return [];
  }

  // If user is logged in, only show their relevant dashboard
  if (userRole === 'admin') {
    // Return empty array for admin - removing the Dashboard button
    return [];
  } else if (userRole === 'cleaner') {
    // Return empty array for cleaner - removing the Dashboard button
    return [];
  }

  return [];
};
