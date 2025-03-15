
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { supabase, createUser } from "@/integrations/supabase/client";
import { UserFormValues, userSchema, getNames, UserDialogProps } from "./userFormSchema";

interface Credentials {
  activation_code: string;
  password: string;
}

export const useUserForm = ({ user, open, onOpenChange, onSuccess }: UserDialogProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [credentials, setCredentials] = useState<Credentials | null>(null);
  
  const { firstName, lastName } = getNames(user?.name);
  
  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      firstName,
      lastName,
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
        phoneNumber: user?.phoneNumber || "",
        startDate: user?.startDate || new Date().toISOString().split('T')[0],
        isActive: user?.status !== "inactive",
        role: (user?.role as "admin" | "cleaner") || "cleaner"
      });
      setCredentials(null);
    }
  }, [open, user, reset]);

  const onSubmit = async (data: UserFormValues) => {
    setIsSubmitting(true);
    
    try {
      if (user?.id) {
        // Update existing user
        const { error: userError } = await supabase
          .from('users')
          .update({
            first_name: data.firstName,
            last_name: data.lastName,
            phone: data.phoneNumber,
            role: data.role,
            start_date: data.startDate,
            active: data.isActive,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);
        
        if (userError) throw userError;
        
        toast({
          title: "User Updated",
          description: "User information has been updated successfully",
        });
        
        onOpenChange(false);
        onSuccess();
      } else {
        // Create new user
        console.log("Creating new user with data:", {
          firstName: data.firstName,
          lastName: data.lastName, 
          role: data.role,
          phoneNumber: data.phoneNumber
        });
        
        // Generate a UUID for the user
        const userId = crypto.randomUUID?.() || 
          'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
          });
        
        // Create a default email derived from name for database requirements
        const defaultEmail = `${data.firstName.toLowerCase()}.${data.lastName.toLowerCase()}@example.com`;
        
        try {
          // Use the database function to create a new user
          const { data: result, error } = await supabase.rpc('create_user', {
            user_id: userId,
            first_name: data.firstName,
            last_name: data.lastName,
            email: defaultEmail,
            phone_number: data.phoneNumber,
            role: data.role,
            start_date: data.startDate,
            is_active: data.isActive
          });
          
          if (error) throw error;
          
          // Display the credentials
          if (result && typeof result === 'object') {
            const jsonResult = result as { activation_code: string; password: string };
            setCredentials({
              activation_code: jsonResult.activation_code,
              password: jsonResult.password
            });
          }
          
          toast({
            title: `${data.role === 'admin' ? 'Admin' : 'Cleaner'} Created`,
            description: `New ${data.role} has been created successfully.`,
          });
          
          // Don't close the dialog when credentials need to be shown
        } catch (error) {
          console.error("Error creating user:", error);
          throw error;
        }
      }
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
    setValue,
    credentials
  };
};
