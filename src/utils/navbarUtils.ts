
export interface NavRoute {
  path: string;
  label: string;
}

export const getNavRoutes = (session: any, userRole: string | null): NavRoute[] => {
  // If user is not logged in, don't show any routes
  if (!session) {
    // For Lavi, show the cleaner dashboard
    return [
      { path: '/cleaners/dashboard', label: 'Dashboard' }
    ];
  }

  // If user is logged in, only show their relevant dashboard
  if (userRole === 'admin') {
    return [
      { path: '/admin/dashboard', label: 'Dashboard' }
    ];
  } else if (userRole === 'cleaner') {
    return [
      { path: '/cleaners/dashboard', label: 'Dashboard' }
    ];
  }

  return [];
};
