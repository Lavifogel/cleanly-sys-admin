
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { UserFormValues, userSchema, getNames, UserDialogProps } from "./userFormSchema";

// Define the response type from create_cleaner_user function
type CreateCleanerResponse = {
  success: boolean;
  message: string;
};

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
      isActive: user?.status !== "inactive"
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
        isActive: user?.status !== "inactive"
      });
    }
  }, [open, user, reset]);

  const onSubmit = async (data: UserFormValues) => {
    setIsSubmitting(true);
    
    try {
      if (user?.id) {
        // Update existing user - create separate transactions for profiles and cleaners
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            first_name: data.firstName,
            last_name: data.lastName,
            email: data.email,
          })
          .eq('id', user.id);
        
        if (profileError) throw profileError;
        
        const { error: cleanerError } = await supabase
          .from('cleaners')
          .update({
            phone: data.phoneNumber,
            start_date: data.startDate,
            active: data.isActive,
          })
          .eq('id', user.id);
        
        if (cleanerError) throw cleanerError;
        
        toast({
          title: "User Updated",
          description: "User information has been updated successfully",
        });
      } else {
        // Create new user using the create_cleaner_user database function
        const newUserId = crypto.randomUUID();
        
        console.log("Creating new user with ID:", newUserId);
        
        // Use explicit typing to avoid TypeScript errors
        const { data: response, error: fnError } = await supabase
          .rpc('create_cleaner_user', {
            user_id: newUserId,
            first_name: data.firstName,
            last_name: data.lastName,
            email: data.email,
            phone_number: data.phoneNumber,
            start_date: data.startDate,
            is_active: data.isActive
          });
        
        if (fnError) {
          console.error("Error creating user:", fnError);
          throw fnError;
        }
        
        // Cast the response to the expected type
        const typedResponse = response as unknown as CreateCleanerResponse;
        
        if (!typedResponse.success) {
          throw new Error(typedResponse.message || 'Failed to create user');
        }
        
        toast({
          title: "User Created",
          description: "New user has been created successfully",
        });
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

  return {
    register,
    handleSubmit,
    errors,
    isSubmitting,
    isActiveValue,
    onSubmit,
    setValue
  };
};
