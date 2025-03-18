
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

  // Cleaners don't have any navigation items in the navbar
  return [];
};
