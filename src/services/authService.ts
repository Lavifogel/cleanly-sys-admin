
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
    
    // Update the cleaning status in the database
    const endTime = new Date().toISOString();
    const { error } = await supabase
      .from('cleanings')
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
    
    // Update the shift status in the database
    const endTime = new Date().toISOString();
    const { error } = await supabase
      .from('shifts')
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
      localStorage.setItem('adminAuth', JSON.stringify(adminUser));
      
      console.log("Admin login successful");
      return { success: true, user: adminUser, role: 'admin' };
    }
    
    // If not using hardcoded admin credentials, try to log in as cleaner
    const { data: cleanerData, error: cleanerError } = await supabase
      .from('users')
      .select('*')
      .eq('phone', phoneNumber)
      .eq('password', password)
      .eq('role', 'cleaner')
      .single();

    if (cleanerError) {
      console.error('Login error from database:', cleanerError);
      return { success: false, error: new Error("Invalid phone number or password") };
    }

    if (cleanerData) {
      console.log("Cleaner data retrieved:", cleanerData);
      
      // Store user info in localStorage
      localStorage.setItem('cleanerAuth', JSON.stringify(cleanerData));
      
      console.log('Cleaner authenticated successfully:', cleanerData);
      return { success: true, user: cleanerData, role: 'cleaner' };
    }

    // If we get here, neither admin nor cleaner login was successful
    console.error('Login error: Invalid credentials');
    return { success: false, error: new Error("Invalid phone number or password") };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error };
  }
};
