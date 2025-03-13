
import { z } from "zod";

// Define the user schema for form validation
export const userSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  startDate: z.string().min(1, "Start date is required"),
  isActive: z.boolean().default(true),
  role: z.enum(["admin", "cleaner"]).default("cleaner")
});

export type UserFormValues = z.infer<typeof userSchema>;

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
  onSuccess: () => void;
}

// Helper function to split a name into first and last name
export const getNames = (name?: string) => {
  if (!name) return { firstName: "", lastName: "" };
  const nameParts = name.split(" ");
  return {
    firstName: nameParts[0] || "",
    lastName: nameParts.slice(1).join(" ") || ""
  };
};
