
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { UserFormValues, userSchema, getNames, UserDialogProps } from "./userFormSchema";

export const useUserForm = ({ user, open, onOpenChange, onSuccess }: UserDialogProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { firstName, lastName } = getNames(user?.name);
  
  // Set up form with default values
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

  // Reset form when dialog opens or user changes
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
        // Update existing user
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
        // Create new user and profile
        // Generate a unique ID for both tables
        const newUserId = crypto.randomUUID();
        
        // First create a profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: newUserId,
            first_name: data.firstName,
            last_name: data.lastName,
            email: data.email,
            role: 'cleaner'
          });
        
        if (profileError) throw profileError;
        
        // Then create the cleaner record
        const { error: cleanerError } = await supabase
          .from('cleaners')
          .insert({
            id: newUserId,
            phone: data.phoneNumber,
            start_date: data.startDate,
            active: data.isActive,
          });
        
        if (cleanerError) throw cleanerError;
        
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
        description: "Could not save user information. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Watch the isActive value
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
