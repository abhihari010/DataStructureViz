import React, { useState, useEffect } from "react";
import { useAuthJWT } from "@/hooks/useAuthJWT";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { User, auth } from "@/lib/api";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Pencil, Save, User as UserIcon, Mail } from "lucide-react";

type ProfileFormData = {
  firstName: string;
  lastName: string;
  email: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export default function SettingsPage() {
  const { user, logout } = useAuthJWT();
  const [isEditing, setIsEditing] = useState(false);
  const [isPasswordEditing, setIsPasswordEditing] = useState(false);
  const queryClient = useQueryClient();
  
  const { register, handleSubmit, reset, formState: { errors }, watch } = useForm<ProfileFormData>({
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
    },
  });

  // Initialize form with user data when user is loaded
  useEffect(() => {
    if (user) {
      reset({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
      });
    }
  }, [user, reset]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: { firstName: string; lastName: string; email: string }) => {
      const response = await auth.getCurrentUser();
      // In a real app, you would call an API endpoint to update the user's profile
      // For now, we'll just update the local cache
      return { ...response.data, ...data };
    },
    onSuccess: (updatedUser: User) => {
      queryClient.setQueryData(['/api/auth/user'], updatedUser);
      toast.success('Profile updated successfully');
      setIsEditing(false);
    },
    onError: () => {
      toast.error('Failed to update profile');
    },
  });

  const updatePasswordMutation = useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      // In a real app, you would call an API endpoint to update the password
      // For now, we'll just simulate a successful response
      return { success: true };
    },
    onSuccess: () => {
      toast.success('Password updated successfully');
      setIsPasswordEditing(false);
      reset({ currentPassword: '', newPassword: '', confirmPassword: '' });
    },
    onError: () => {
      toast.error('Failed to update password');
    },
  });

  const onSubmitProfile = (data: ProfileFormData) => {
    updateProfileMutation.mutate({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
    });
  };

  const onSubmitPassword = (data: ProfileFormData) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    updatePasswordMutation.mutate({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    });
  };

  const handleLogout = () => {
    logout();
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>
      
      {/* Profile Section */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Update your profile information</CardDescription>
            </div>
            {!isEditing ? (
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                <Pencil className="mr-2 h-4 w-4" /> Edit
              </Button>
            ) : (
              <div className="space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    reset();
                    setIsEditing(false);
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmit(onSubmitProfile)}
                  disabled={updateProfileMutation.isPending}
                >
                  {updateProfileMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Save Changes
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex flex-col items-center">
              <Avatar className="h-24 w-24 mb-4">
                {user?.avatar ? (
                  <AvatarImage src={user.avatar} alt={`${user.firstName} ${user.lastName}`} />
                ) : (
                  <AvatarFallback className="text-2xl">
                    {user ? getInitials(`${user.firstName} ${user.lastName}`) : <UserIcon className="h-12 w-12" />}
                  </AvatarFallback>
                )}
              </Avatar>
              <Button variant="outline" size="sm">
                Change Photo
              </Button>
            </div>
            
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                {isEditing ? (
                  <Input
                    id="firstName"
                    {...register('firstName', { required: 'First name is required' })}
                    disabled={updateProfileMutation.isPending}
                  />
                ) : (
                  <div className="px-3 py-2 text-sm">{user?.firstName}</div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                {isEditing ? (
                  <Input
                    id="lastName"
                    {...register('lastName', { required: 'Last name is required' })}
                    disabled={updateProfileMutation.isPending}
                  />
                ) : (
                  <div className="px-3 py-2 text-sm">{user?.lastName}</div>
                )}
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="email">Email</Label>
                {isEditing ? (
                  <div className="flex items-center">
                    <div className="relative flex-1">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                      <Input
                        id="email"
                        type="email"
                        className="pl-10"
                        {...register('email', { 
                          required: 'Email is required',
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: 'Invalid email address',
                          },
                        })}
                        disabled={updateProfileMutation.isPending}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center px-3 py-2 text-sm">
                    <Mail className="mr-2 h-4 w-4 text-gray-500" />
                    {user?.email}
                  </div>
                )}
                {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Password Section */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your password</CardDescription>
            </div>
            {!isPasswordEditing ? (
              <Button variant="outline" onClick={() => setIsPasswordEditing(true)}>
                <Pencil className="mr-2 h-4 w-4" /> Change Password
              </Button>
            ) : (
              <div className="space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    reset({ currentPassword: '', newPassword: '', confirmPassword: '' });
                    setIsPasswordEditing(false);
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmit(onSubmitPassword)}
                  disabled={updatePasswordMutation.isPending}
                >
                  {updatePasswordMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Save Password
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        {isPasswordEditing && (
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-1 gap-6 max-w-2xl">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  {...register('currentPassword', { required: 'Current password is required' })}
                  disabled={updatePasswordMutation.isPending}
                />
                {errors.currentPassword && (
                  <p className="text-sm text-red-500">{errors.currentPassword.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  {...register('newPassword', { 
                    required: 'New password is required',
                    minLength: {
                      value: 8,
                      message: 'Password must be at least 8 characters',
                    },
                  })}
                  disabled={updatePasswordMutation.isPending}
                />
                {errors.newPassword && (
                  <p className="text-sm text-red-500">{errors.newPassword.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  {...register('confirmPassword', { 
                    required: 'Please confirm your new password',
                    validate: (value) => 
                      value === watch('newPassword') || 'Passwords do not match',
                  })}
                  disabled={updatePasswordMutation.isPending}
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        )}
      </Card>
      
      {/* Danger Zone */}
      <Card className="border-red-100">
        <CardHeader>
          <CardTitle className="text-red-600">Danger Zone</CardTitle>
          <CardDescription>Irreversible and destructive actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h4 className="font-medium">Sign out of all devices</h4>
              <p className="text-sm text-muted-foreground">
                This will log you out of all devices where you're currently signed in.
              </p>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              Sign Out Everywhere
            </Button>
          </div>
          
          <div className="mt-6 pt-6 border-t border-red-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h4 className="font-medium text-red-600">Delete Account</h4>
              <p className="text-sm text-muted-foreground">
                Permanently delete your account and all associated data.
              </p>
            </div>
            <Button variant="destructive">Delete Account</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
