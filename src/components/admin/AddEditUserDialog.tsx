
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import UserForm from "./user-dialog/UserForm";
import { UserDialogProps } from "./user-dialog/userFormSchema";

const AddEditUserDialog = (props: UserDialogProps) => {
  const { open, onOpenChange, user } = props;

  const handleCredentialsGenerated = (password: string) => {
    // Close the dialog after generating credentials
    props.onOpenChange(false);
    if (props.onSuccess) props.onSuccess();
  };

  return (
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
  );
};

export default AddEditUserDialog;
