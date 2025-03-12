import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { UserFormValues, userSchema, getNames, UserDialogProps } from "./userFormSchema";

// Helper function to generate a UUID (RFC4122 version 4 compliant)
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export const useUserForm = ({ user, open, onOpenChange, onSuccess }: UserDialogProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { firstName, lastName } = getNames(user?.name);
  
  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      firstName,
      lastName,
      email: user?.email || "",
      phoneNumber: user?.phoneNumber || "",
      startDate: user?.startDate || new Date().toISOString().split('T')[0],
      isActive: user?.status !== "inactive",
      role: (user?.role as "admin" | "cleaner") || "cleaner"
    }
  });

  useEffect(() => {
    if (open) {
      const { firstName, lastName } = getNames(user?.name);
      reset({
        firstName,
        lastName,
        email: user?.email || "",
        phoneNumber: user?.phoneNumber || "",
        startDate: user?.startDate || new Date().toISOString().split('T')[0],
        isActive: user?.status !== "inactive",
        role: (user?.role as "admin" | "cleaner") || "cleaner"
      });
    }
  }, [open, user, reset]);

  const onSubmit = async (data: UserFormValues) => {
    setIsSubmitting(true);
    
    try {
      if (user?.id) {
        // Update existing user
        // First update the profiles table
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            first_name: data.firstName,
            last_name: data.lastName,
            email: data.email,
            user_name: data.phoneNumber, // Use phoneNumber as user_name
            role: data.role
          })
          .eq('id', user.id);
        
        if (profileError) throw profileError;
        
        // If role is cleaner, update the cleaners table
        if (data.role === 'cleaner') {
          const { error: cleanerError } = await supabase
            .from('cleaners')
            .update({
              phone: data.phoneNumber,
              start_date: data.startDate,
              active: data.isActive,
            })
            .eq('id', user.id);
          
          if (cleanerError) throw cleanerError;
        } else if (data.role === 'admin') {
          // If role is admin, make sure there's an entry in the admins table
          const { error: adminError } = await supabase
            .from('admins')
            .upsert({
              id: user.id,
              updated_at: new Date().toISOString()
            });
          
          if (adminError) throw adminError;
        }
        
        toast({
          title: "User Updated",
          description: "User information has been updated successfully",
        });
      } else {
        // Create new user
        console.log("Creating new user with data:", {
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName, 
          role: data.role,
          phoneNumber: data.phoneNumber
        });
        
        // Call the RPC function to create a cleaner user
        if (data.role === 'cleaner') {
          // Try using the create_cleaner_user function that exists in your database
          const password = `${data.firstName.toLowerCase()}${data.lastName.toLowerCase()}123!`;
          
          // Generate a UUID for the user
          const userId = crypto.randomUUID?.() || 
            'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
              const r = Math.random() * 16 | 0;
              const v = c === 'x' ? r : (r & 0x3 | 0x8);
              return v.toString(16);
            });
          
          // Use the database function to create a new cleaner
          const { data: rpcData, error: rpcError } = await supabase.rpc(
            'create_cleaner_user',
            {
              user_id: userId,
              first_name: data.firstName,
              last_name: data.lastName,
              email: data.email,
              phone_number: data.phoneNumber,
              start_date: data.startDate,
              is_active: data.isActive
            }
          );
          
          if (rpcError) {
            console.error("Error creating user with RPC function:", rpcError);
            
            // If this is a rate limit issue
            if (rpcError.message.includes("security purposes") || 
                rpcError.message.includes("rate limit") || 
                rpcError.message.includes("seconds")) {
              throw new Error("Rate limit reached. Please wait a minute before trying again.");
            }
            
            throw rpcError;
          }
          
          toast({
            title: "Cleaner Created",
            description: `New cleaner has been created successfully. Note: Authentication will need to be set up separately.`,
          });
        } else {
          // For admins, use a simpler approach similar to cleaners
          const password = `${data.firstName.toLowerCase()}${data.lastName.toLowerCase()}123!`;
          
          // Generate a UUID for the user
          const userId = crypto.randomUUID?.() || 
            'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
              const r = Math.random() * 16 | 0;
              const v = c === 'x' ? r : (r & 0x3 | 0x8);
              return v.toString(16);
            });
          
          // First create the profile
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: userId,
              first_name: data.firstName,
              last_name: data.lastName,
              email: data.email,
              user_name: data.email,
              role: 'admin'
            });
          
          if (profileError) {
            console.error("Error creating admin profile:", profileError);
            throw profileError;
          }
          
          // Then create the admin record
          const { error: adminError } = await supabase
            .from('admins')
            .insert({
              id: userId
            });
          
          if (adminError) {
            console.error("Error creating admin record:", adminError);
            throw adminError;
          }
          
          toast({
            title: "Admin Created",
            description: `New admin has been created. Note: Authentication will need to be set up separately.`,
          });
        }
      }
      
      onOpenChange(false);
      onSuccess();
      
    } catch (error) {
      console.error('Error saving user:', error);
      toast({
        title: "Operation Failed",
        description: `Could not save user information: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isActiveValue = watch("isActive");
  const roleValue = watch("role");

  return {
    register,
    handleSubmit,
    errors,
    isSubmitting,
    isActiveValue,
    roleValue,
    onSubmit,
    setValue
  };
};
