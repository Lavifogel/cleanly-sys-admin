
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DialogFooter } from "@/components/ui/dialog";
import { useUserForm } from "./useUserForm";
import { UserDialogProps } from "./userFormSchema";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Check, Copy } from "lucide-react";

const UserForm = (props: UserDialogProps) => {
  const { 
    register, 
    handleSubmit, 
    errors, 
    isSubmitting, 
    isActiveValue, 
    onSubmit,
    setValue,
    roleValue,
    credentials
  } = useUserForm(props);

  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

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
      
      <div className="space-y-2">
        <Label htmlFor="role">Role</Label>
        <Select 
          value={roleValue} 
          onValueChange={(value) => setValue("role", value as "admin" | "cleaner")}
        >
          <SelectTrigger id="role">
            <SelectValue placeholder="Select a role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cleaner">Cleaner</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
        {errors.role && (
          <p className="text-sm text-red-500">{errors.role.message}</p>
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

      {credentials && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-4 space-y-3">
            <h3 className="font-medium text-green-800">Login Credentials</h3>
            <p className="text-sm text-green-700">Share these credentials with the user for their first login:</p>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between bg-white rounded p-2 border border-green-200">
                <div>
                  <span className="text-xs text-gray-500 block">Password</span>
                  <span className="font-mono">{credentials.password}</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => copyToClipboard(credentials.password, 'password')}
                >
                  {copiedField === 'password' ? <Check size={18} /> : <Copy size={18} />}
                </Button>
              </div>
              
              <div className="flex items-center justify-between bg-white rounded p-2 border border-green-200">
                <div>
                  <span className="text-xs text-gray-500 block">Activation Code</span>
                  <span className="font-mono">{credentials.activation_code}</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => copyToClipboard(credentials.activation_code, 'code')}
                >
                  {copiedField === 'code' ? <Check size={18} /> : <Copy size={18} />}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
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
