
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
        const newUserId = crypto.randomUUID();
        console.log("Creating new user with data:", {
          id: newUserId,
          first_name: data.firstName,
          last_name: data.lastName,
          email: data.email,
          role: data.role,
          user_name: data.phoneNumber
        });
        
        // Direct insertion approach without the database function
        // First, insert into profiles
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: newUserId,
            first_name: data.firstName,
            last_name: data.lastName,
            email: data.email,
            role: data.role,
            user_name: data.phoneNumber
          });
        
        if (profileError) {
          console.error("Error creating profile:", profileError);
          throw profileError;
        }
        
        // Then, based on role, insert into either cleaners or admins
        if (data.role === 'cleaner') {
          const { error: cleanerError } = await supabase
            .from('cleaners')
            .insert({
              id: newUserId,
              phone: data.phoneNumber,
              start_date: data.startDate,
              active: data.isActive
            });
          
          if (cleanerError) {
            console.error("Error creating cleaner:", cleanerError);
            throw cleanerError;
          }
        } else if (data.role === 'admin') {
          const { error: adminError } = await supabase
            .from('admins')
            .insert({
              id: newUserId
            });
          
          if (adminError) {
            console.error("Error creating admin:", adminError);
            throw adminError;
          }
        }
        
        toast({
          title: "User Created",
          description: `New ${data.role} has been created successfully`,
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
