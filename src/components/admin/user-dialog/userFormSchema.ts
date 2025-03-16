
import { z } from "zod";

export interface UserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: {
    id?: string;
    phoneNumber?: string;
    name?: string;
    email?: string;
    startDate?: string;
    status?: string;
    role?: string;
  } | null;
  onSuccess?: () => void;
  onCredentialsGenerated?: (activationCode: string, password: string) => void;
}

export const userSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phoneNumber: z.string().min(6, "Phone number is required"),
  startDate: z.string().min(1, "Start date is required"),
  isActive: z.boolean().default(true),
  role: z.enum(["admin", "cleaner"]).default("cleaner")
});

export type UserFormValues = z.infer<typeof userSchema>;

// Helper function to split a full name into first and last name
export const getNames = (fullName?: string): { firstName: string, lastName: string } => {
  if (!fullName) return { firstName: "", lastName: "" };
  
  const parts = fullName.trim().split(" ");
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  
  const firstName = parts[0];
  const lastName = parts.slice(1).join(" ");
  
  return { firstName, lastName };
};
