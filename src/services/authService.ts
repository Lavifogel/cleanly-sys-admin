
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
 * Creates an admin account with specific credentials if it doesn't exist
 */
export async function createAdminAccount(phoneNumber: string, password: string) {
  try {
    // Check if the user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('phone', phoneNumber)
      .single();
    
    // If there's no error, it means the user exists
    if (existingUser) {
      console.log("Admin account already exists");
      
      // Update the password if needed
      const { error: updateError } = await supabase
        .from('users')
        .update({
          password: password,
          active: true,
          role: 'admin'
        })
        .eq('phone', phoneNumber);
      
      if (updateError) {
        console.error("Error updating admin account:", updateError);
        return { success: false, error: "Failed to update admin account" };
      }
      
      return { success: true, message: "Admin account updated" };
    }
    
    // Create a new admin account
    const userId = crypto.randomUUID();
    const { error: insertError } = await supabase
      .from('users')
      .insert({
        id: userId,
        phone: phoneNumber,
        password: password,
        first_name: 'Admin',
        last_name: 'User',
        email: `${phoneNumber}@example.com`,
        role: 'admin',
        active: true,
        is_first_login: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    
    if (insertError) {
      console.error("Error creating admin account:", insertError);
      return { success: false, error: "Failed to create admin account" };
    }
    
    return { success: true, message: "Admin account created successfully" };
  } catch (error) {
    console.error("Error in createAdminAccount:", error);
    return { success: false, error: "An unexpected error occurred" };
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
