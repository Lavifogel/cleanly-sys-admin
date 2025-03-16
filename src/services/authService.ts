
import { supabase } from "@/integrations/supabase/client";

/**
 * Attempts to log in a user with phone number and password
 */
export async function loginWithPhoneAndPassword(phoneNumber: string, password: string) {
  try {
    // First, find the user with this phone number
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, phone, password, first_name, last_name, role, active')
      .eq('phone', phoneNumber)
      .single();
    
    if (userError || !userData) {
      console.error("User lookup error:", userError);
      return { 
        success: false, 
        error: "No user found with this phone number" 
      };
    }
    
    // Check if user is active
    if (!userData.active) {
      return {
        success: false,
        error: "This account has been deactivated. Please contact an administrator."
      };
    }
    
    // Verify password
    if (userData.password !== password) {
      return { 
        success: false, 
        error: "Incorrect password" 
      };
    }
    
    // Create a custom session in localStorage
    const session = {
      userId: userData.id,
      phoneNumber: userData.phone,
      firstName: userData.first_name,
      lastName: userData.last_name,
      role: userData.role,
      isAuthenticated: true,
      loginTime: new Date().toISOString()
    };
    
    localStorage.setItem('userSession', JSON.stringify(session));
    
    return {
      success: true,
      session
    };
  } catch (error) {
    console.error("Login error:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again."
    };
  }
}

/**
 * Logs out the current user
 */
export function logout() {
  localStorage.removeItem('userSession');
  window.location.href = '/login';
}

/**
 * Gets the current user session
 */
export function getCurrentSession() {
  const sessionStr = localStorage.getItem('userSession');
  if (!sessionStr) return null;
  
  try {
    return JSON.parse(sessionStr);
  } catch (e) {
    localStorage.removeItem('userSession');
    return null;
  }
}

/**
 * Checks if the user is authenticated
 */
export function isAuthenticated() {
  return !!getCurrentSession()?.isAuthenticated;
}

/**
 * Gets current user role
 */
export function getUserRole() {
  return getCurrentSession()?.role || null;
}
