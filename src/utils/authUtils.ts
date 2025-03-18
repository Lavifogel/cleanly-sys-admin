
// Helper function to check authentication status from local storage
export const checkAuthFromStorage = () => {
  // Check localStorage for auth token
  const authToken = localStorage.getItem('cleanerAuth');
  const adminToken = localStorage.getItem('adminAuth');
  
  if (authToken) {
    try {
      const userData = JSON.parse(authToken);
      console.log("Found cleaner auth token for:", userData.full_name || `${userData.first_name} ${userData.last_name}`);
      return {
        isAuthenticated: true,
        userRole: 'cleaner',
        userName: userData.full_name || `${userData.first_name} ${userData.last_name}`,
        userData
      };
    } catch (error) {
      console.error('Error parsing auth token:', error);
      localStorage.removeItem('cleanerAuth');
      return { isAuthenticated: false, userRole: null, userName: null, userData: null };
    }
  } else if (adminToken) {
    try {
      const userData = JSON.parse(adminToken);
      console.log("Found admin auth token for:", userData.full_name || `${userData.first_name} ${userData.last_name}`);
      return {
        isAuthenticated: true,
        userRole: 'admin',
        userName: userData.full_name || `${userData.first_name} ${userData.last_name}`,
        userData
      };
    } catch (error) {
      console.error('Error parsing admin token:', error);
      localStorage.removeItem('adminAuth');
      return { isAuthenticated: false, userRole: null, userName: null, userData: null };
    }
  }
  
  return { isAuthenticated: false, userRole: null, userName: null, userData: null };
};

// Helper function to clear auth data from localStorage
export const clearAuthData = () => {
  localStorage.removeItem('cleanerAuth');
  localStorage.removeItem('adminAuth');
};
