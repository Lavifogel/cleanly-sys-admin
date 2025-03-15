
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { getNames, userSchema, type UserFormValues } from "./userFormSchema";

interface CreateUserResponse {
  success: boolean;
  message: string;
  activation_code?: string;
  password?: string;
}

export const useUserForm = (
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
  onSuccess: () => void
) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activationCode, setActivationCode] = useState("");
  const [password, setPassword] = useState("");
  const [showCredentials, setShowCredentials] = useState(false);

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

  const handleSubmit = async (data: UserFormValues) => {
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
        onSuccess();
      } else {
        // Create new user with UUID
        const userId = crypto.randomUUID();
        
        const { data: responseData, error } = await supabase.rpc('create_user', {
          user_id: userId,
          first_name: data.firstName,
          last_name: data.lastName,
          email: `${data.phoneNumber}@example.com`, // Temporary email
          phone_number: data.phoneNumber,
          role: data.role,
          start_date: data.startDate,
          is_active: data.isActive
        });
        
        if (error) throw error;
        
        // Type assertion to handle the response properly
        const typedResponse = responseData as CreateUserResponse;
        
        if (typedResponse && typedResponse.success) {
          setActivationCode(typedResponse.activation_code || "");
          setPassword(typedResponse.password || "");
          setShowCredentials(true);
        } else {
          throw new Error("Failed to create user");
        }
        
        toast({
          title: "User Created",
          description: "New user has been created successfully",
        });
        
        onSuccess();
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

  const closeDialog = () => {
    setShowCredentials(false);
    onOpenChange(false);
    form.reset();
  };

  return {
    form,
    isSubmitting,
    activationCode,
    password,
    showCredentials,
    setShowCredentials,
    handleSubmit: form.handleSubmit(handleSubmit),
    closeDialog
  };
};
