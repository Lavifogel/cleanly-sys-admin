
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DialogFooter } from "@/components/ui/dialog";
import { useUserForm } from "./useUserForm";
import { UserDialogProps } from "./userFormSchema";

const UserForm = (props: UserDialogProps) => {
  const { 
    register, 
    handleSubmit, 
    errors, 
    isSubmitting, 
    isActiveValue, 
    onSubmit,
    setValue
  } = useUserForm(props);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input 
            id="firstName"
            {...register("firstName")}
            placeholder="John"
          />
          {errors.firstName && (
            <p className="text-sm text-red-500">{errors.firstName.message}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input 
            id="lastName"
            {...register("lastName")}
            placeholder="Doe"
          />
          {errors.lastName && (
            <p className="text-sm text-red-500">{errors.lastName.message}</p>
          )}
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input 
          id="email"
          type="email"
          {...register("email")}
          placeholder="john.doe@example.com"
        />
        {errors.email && (
          <p className="text-sm text-red-500">{errors.email.message}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="phoneNumber">Phone Number</Label>
        <Input 
          id="phoneNumber"
          {...register("phoneNumber")}
          placeholder="+1234567890"
        />
        {errors.phoneNumber && (
          <p className="text-sm text-red-500">{errors.phoneNumber.message}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="startDate">Start Date</Label>
        <Input 
          id="startDate"
          type="date"
          {...register("startDate")}
        />
        {errors.startDate && (
          <p className="text-sm text-red-500">{errors.startDate.message}</p>
        )}
      </div>
      
      <div className="flex items-center space-x-2">
        <Switch 
          id="isActive" 
          checked={isActiveValue} 
          onCheckedChange={(checked) => setValue("isActive", checked)}
        />
        <Label htmlFor="isActive">Active Status</Label>
      </div>
      
      <DialogFooter>
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => props.onOpenChange(false)}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : props.user?.id ? "Save Changes" : "Create User"}
        </Button>
      </DialogFooter>
    </form>
  );
};

export default UserForm;
