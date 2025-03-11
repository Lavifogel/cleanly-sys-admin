
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
        // For new users, we need to perform operations carefully
        // Generate a unique ID that we'll use for both tables
        const newUserId = crypto.randomUUID();
        
        // Log the data we're about to insert for debugging
        console.log("Creating new user with ID:", newUserId);
        console.log("Profile data:", {
          id: newUserId,
          first_name: data.firstName,
          last_name: data.lastName,
          email: data.email,
          role: 'cleaner'
        });
        
        try {
          // Insert both records in a single transaction to ensure consistency
          const { data: result, error } = await supabase.rpc('create_cleaner_user', {
            user_id: newUserId,
            first_name: data.firstName,
            last_name: data.lastName,
            email: data.email,
            phone_number: data.phoneNumber,
            start_date: data.startDate,
            is_active: data.isActive
          });
          
          if (error) {
            console.error("Error creating user via RPC:", error);
            throw error;
          }
          
          console.log("User created successfully:", result);
          
          toast({
            title: "User Created",
            description: "New user has been created successfully",
          });
        } catch (transactionError) {
          console.error("Transaction error:", transactionError);
          
          // Fallback approach: try inserting records one by one
          console.log("Falling back to separate inserts approach");
          
          // First, profiles insert
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: newUserId,
              first_name: data.firstName,
              last_name: data.lastName,
              email: data.email,
              role: 'cleaner'
            });
          
          if (profileError) {
            console.error("Fallback profile insert error:", profileError);
            throw profileError;
          }
          
          // Then cleaners insert, if profile succeeded
          const { error: cleanerError } = await supabase
            .from('cleaners')
            .insert({
              id: newUserId,
              phone: data.phoneNumber,
              start_date: data.startDate,
              active: data.isActive,
            });
          
          if (cleanerError) {
            console.error("Fallback cleaner insert error:", cleanerError);
            // If cleaner insert fails, try to clean up the profile we just created
            await supabase.from('profiles').delete().eq('id', newUserId);
            throw cleanerError;
          }
          
          toast({
            title: "User Created",
            description: "New user has been created successfully",
          });
        }
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
