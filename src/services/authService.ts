
import { supabase } from '@/integrations/supabase/client';

// Function to close active cleaning in database
export const closeActiveCleaning = async () => {
  // First, check if there's an active cleaning in localStorage
  const activeCleaningStr = localStorage.getItem('activeCleaning');
  if (!activeCleaningStr) return false;
  
  try {
    const activeCleaning = JSON.parse(activeCleaningStr);
    if (!activeCleaning || !activeCleaning.id) return false;
    
    console.log("Found active cleaning to close on logout:", activeCleaning.id);
    
    // Update the cleaning status in the database via activity_logs
    const endTime = new Date().toISOString();
    const { error } = await supabase
      .from('activity_logs')
      .update({
        end_time: endTime,
        status: 'finished automatically',
        notes: (activeCleaning.notes || '') + ' Automatically closed on logout'
      })
      .eq('id', activeCleaning.id);
    
    if (error) {
      console.error("Error closing active cleaning:", error);
      return false;
    }
    
    // Remove the active cleaning from localStorage
    localStorage.removeItem('activeCleaning');
    localStorage.removeItem('cleaningTimer');
    localStorage.removeItem('cleaningStartTime');
    localStorage.removeItem('cleaningPaused');
    return true;
  } catch (error) {
    console.error("Error parsing active cleaning:", error);
    localStorage.removeItem('activeCleaning');
    return false;
  }
};

// Function to close active shift in database
export const closeActiveShift = async () => {
  // Check if there's an active shift in localStorage
  const activeShiftStr = localStorage.getItem('activeShift');
  if (!activeShiftStr) return false;
  
  try {
    const activeShift = JSON.parse(activeShiftStr);
    if (!activeShift || !activeShift.id) return false;
    
    console.log("Found active shift to close on logout:", activeShift.id);
    
    // Update the shift status in the database via activity_logs
    const endTime = new Date().toISOString();
    const { error } = await supabase
      .from('activity_logs')
      .update({
        end_time: endTime,
        status: 'finished automatically'
      })
      .eq('id', activeShift.id);
    
    if (error) {
      console.error("Error closing active shift:", error);
      return false;
    }
    
    console.log("Successfully closed shift on logout:", activeShift.id);
    
    // Remove the active shift from localStorage
    localStorage.removeItem('activeShift');
    localStorage.removeItem('shiftStartTime');
    localStorage.removeItem('shiftTimer');
    return true;
  } catch (error) {
    console.error("Error parsing active shift:", error);
    localStorage.removeItem('activeShift');
    localStorage.removeItem('shiftStartTime');
    localStorage.removeItem('shiftTimer');
    return false;
  }
};

// Function to login with credentials
export const loginWithCredentials = async (phoneNumber: string, password: string) => {
  try {
    console.log("Attempting login with phone:", phoneNumber);
    
    // Check for admin login (country code +123 and phone number 4567890)
    if (phoneNumber === '+1234567890' && password === '654321') {
      // Create admin user object
      const adminUser = {
        id: 'admin-id',
        first_name: 'Admin',
        last_name: 'User',
        role: 'admin',
        phone: phoneNumber
      };
      
      // Store admin info in localStorage
      localStorage.setItem('auth', JSON.stringify({ 
        userData: {
          id: adminUser.id,
          firstName: adminUser.first_name,
          lastName: adminUser.last_name,
          fullName: `${adminUser.first_name} ${adminUser.last_name}`,
          role: adminUser.role,
          phone: adminUser.phone
        } 
      }));
      
      console.log("Admin login successful, stored in localStorage");
      return { 
        success: true, 
        user: {
          id: adminUser.id,
          firstName: adminUser.first_name,
          lastName: adminUser.last_name,
          fullName: `${adminUser.first_name} ${adminUser.last_name}`,
          role: adminUser.role,
          phone: adminUser.phone
        }, 
        role: 'admin' 
      };
    }
    
    // If not using hardcoded admin credentials, try to log in as cleaner
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .eq('phone', phoneNumber)
      .limit(1);
    
    if (error) {
      console.error('Login error from database:', error);
      return { success: false, error: new Error("Invalid phone number or password") };
    }
    
    if (users && users.length > 0) {
      const user = users[0];
      console.log("User data retrieved:", user);
      
      // Check if password is not set and needs to be updated
      if (!user.password) {
        console.log("User has no password, setting password:", password);
        
        const { error: updateError } = await supabase
          .from('users')
          .update({ password })
          .eq('id', user.id);
        
        if (updateError) {
          console.error('Error updating password:', updateError);
          return { success: false, error: new Error("Failed to set up account") };
        }
        
        user.password = password;
      } 
      // Verify password matches - using exact equality as passwords are stored as plain text
      else if (user.password !== password) {
        console.error('Invalid password. Expected:', user.password, 'Received:', password);
        return { success: false, error: new Error("Invalid phone number or password") };
      }
      
      // Prepare user data for localStorage
      const userData = {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        fullName: user.full_name || `${user.first_name || ''} ${user.last_name || ''}`.trim(),
        role: user.role,
        email: user.email,
        phone: user.phone
      };
      
      // Store user info in localStorage
      localStorage.setItem('auth', JSON.stringify({ userData }));
      
      console.log('User authenticated successfully:', userData);
      return { success: true, user: userData, role: user.role };
    }

    console.error('Login error: No user found with phone number:', phoneNumber);
    return { success: false, error: new Error("Invalid phone number or password") };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error };
  }
};
