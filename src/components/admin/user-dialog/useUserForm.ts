
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { getNames, userSchema, type UserFormValues } from "./userFormSchema";

interface CreateUserResponse {
  success: boolean;
  message: string;
  password?: string;
}

export const useUserForm = (
  props: {
    user: {
      id?: string;
      phoneNumber?: string;
      name?: string;
      email?: string;
      startDate?: string;
      status?: string;
      role?: string;
    } | null,
    onOpenChange: (open: boolean) => void,
    onSuccess?: () => void,
    onCredentialsGenerated?: (password: string) => void
  }
) => {
  const { user, onOpenChange, onSuccess, onCredentialsGenerated } = props;
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { firstName, lastName } = getNames(user?.name);

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      firstName: firstName,
      lastName: lastName,
      phoneNumber: user?.phoneNumber || "",
      startDate: user?.startDate || new Date().toISOString().split("T")[0],
      isActive: user?.status !== "inactive",
      role: (user?.role as "admin" | "cleaner") || "cleaner"
    }
  });

  const { register, handleSubmit, formState: { errors }, setValue, watch } = form;
  
  // Watch values for reactive updates
  const isActiveValue = watch("isActive");
  const roleValue = watch("role");

  const onSubmit = async (data: UserFormValues) => {
    setIsSubmitting(true);
    
    try {
      if (user?.id) {
        // Update existing user
        
        const { error } = await supabase
          .from('users')
          .update({
            first_name: data.firstName,
            last_name: data.lastName,
            phone: data.phoneNumber,
            start_date: data.startDate,
            active: data.isActive,
            role: data.role,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);
        
        if (error) throw error;

        toast({
          title: "User Updated",
          description: "User information has been updated successfully",
        });

        onOpenChange(false);
        if (onSuccess) onSuccess();
      } else {
        // Create new user with UUID
        const userId = crypto.randomUUID();
        
        // Generate a random numeric password (6 digits)
        const password = Array(6)
          .fill(0)
          .map(() => Math.floor(Math.random() * 10).toString())
          .join('');
        
        // Use the create_user_with_password function
        const { data: responseData, error } = await supabase.rpc('create_user_with_password', {
          user_id: userId,
          first_name: data.firstName,
          last_name: data.lastName,
          email: `${data.phoneNumber}@example.com`, // Temporary email
          phone_number: data.phoneNumber,
          role: data.role,
          start_date: data.startDate,
          is_active: data.isActive,
          password: password
        });
        
        if (error) throw error;
        
        // Cast responseData to the expected type
        const typedResponse = responseData as unknown as CreateUserResponse;
        
        if (typedResponse && typedResponse.success) {
          if (typedResponse.password && onCredentialsGenerated) {
            onCredentialsGenerated(typedResponse.password);
          }
        } else {
          throw new Error("Failed to create user");
        }
        
        toast({
          title: "User Created",
          description: "New user has been created successfully",
        });
        
        if (onSuccess) onSuccess();
      }
    } catch (error: any) {
      console.error('Error saving user:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save user information",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    register,
    handleSubmit,
    errors,
    isSubmitting,
    isActiveValue,
    onSubmit,
    setValue,
    roleValue
  };
};
