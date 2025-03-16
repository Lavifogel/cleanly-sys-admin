
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import UserForm from "./user-dialog/UserForm";
import { UserDialogProps } from "./user-dialog/userFormSchema";
import { useState } from "react";
import CredentialsDialog from "./user-management/CredentialsDialog";

const AddEditUserDialog = (props: UserDialogProps) => {
  const { open, onOpenChange, user } = props;
  const [password, setPassword] = useState<string | null>(null);

  const handleCredentialsGenerated = (password: string) => {
    setPassword(password);
  };

  const closeCredentialsDialog = () => {
    setPassword(null);
    props.onOpenChange(false);
    if (props.onSuccess) props.onSuccess();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{user?.id ? "Edit User" : "Add New User"}</DialogTitle>
            <DialogDescription>
              {user?.id 
                ? "Update the user's information below" 
                : "Fill in the details to create a new user"}
            </DialogDescription>
          </DialogHeader>
          
          <UserForm 
            {...props} 
            onCredentialsGenerated={handleCredentialsGenerated}
          />
        </DialogContent>
      </Dialog>

      {password && (
        <CredentialsDialog
          open={!!password}
          onClose={closeCredentialsDialog}
          password={password}
          title="New User Created"
          description="Share this password with the user. They will need it to log in with their phone number."
        />
      )}
    </>
  );
};

export default AddEditUserDialog;
