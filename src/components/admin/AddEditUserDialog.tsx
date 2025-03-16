
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
  const [credentials, setCredentials] = useState<{
    activationCode: string;
    password: string;
  } | null>(null);

  const handleCredentialsGenerated = (activationCode: string, password: string) => {
    setCredentials({ activationCode, password });
  };

  const closeCredentialsDialog = () => {
    setCredentials(null);
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

      {credentials && (
        <CredentialsDialog
          open={!!credentials}
          onClose={closeCredentialsDialog}
          activationCode={credentials.activationCode}
          password={credentials.password}
          title="New User Created"
          description="Share these credentials with the user. They will need them to log in for the first time."
        />
      )}
    </>
  );
};

export default AddEditUserDialog;
