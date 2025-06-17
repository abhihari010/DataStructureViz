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
import { ArrowLeft, Loader2, Pencil, Save, User as UserIcon, Mail, Lock, Check } from "lucide-react";
import { Link } from "wouter";

type ProfileFormData = {
  firstName: string;
  lastName: string;
  email: string;
};

type PasswordFormData = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export default function SettingsPage() {
  const { user, logout } = useAuthJWT();
  const [isEditing, setIsEditing] = useState(false);
  const [isPasswordEditing, setIsPasswordEditing] = useState(false);
  const queryClient = useQueryClient();
  
  // Profile form
  const { 
    register: registerProfile, 
    handleSubmit: handleProfileSubmit, 
    reset: resetProfile, 
    formState: { errors: profileErrors } 
  } = useForm<ProfileFormData>();

  // Password form
  const { 
    register: registerPassword, 
    handleSubmit: handlePasswordSubmit, 
    reset: resetPassword, 
    formState: { errors: passwordErrors },
    watch,
    setValue,
    trigger,
    getValues
  } = useForm<PasswordFormData>({
    mode: 'onChange',
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  });
  
  const newPassword = watch('newPassword');

  // Set initial form values when user data is available
  useEffect(() => {
    if (user) {
      resetProfile({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || ''
      });
      
      // Reset password form
      setValue('currentPassword', '');
      setValue('newPassword', '');
      setValue('confirmPassword', '');
    }
  }, [user, resetProfile, setValue]);

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
      if (!data.currentPassword || !data.newPassword) {
        throw new Error('Both current and new password are required');
      }
      
      const payload = {
        currentPassword: data.currentPassword.trim(),
        newPassword: data.newPassword.trim()
      };
      
      const response = await auth.changePassword(payload);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Password updated successfully');
      setIsPasswordEditing(false);
      resetPassword();
      // Log out user after password change for security
      setTimeout(() => {
        logout();
      }, 1000);
    },
    onError: (error: any) => {
      const errorMessage = error.message || 'Failed to update password. Please try again.';
      toast.error(errorMessage);
      console.error('Password update error:', error);
    },
  });

  const onSubmitProfile = (data: ProfileFormData) => {
    updateProfileMutation.mutate({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email
    });
  };

  const onSubmitPassword = async (data: PasswordFormData) => {
    // Client-side validation
    if (!data.currentPassword || !data.newPassword || !data.confirmPassword) {
      toast.error('All fields are required');
      throw new Error('All fields are required');
    }
    
    if (data.newPassword !== data.confirmPassword) {
      toast.error('New password and confirmation do not match');
      throw new Error('Passwords do not match');
    }
    
    // Additional password strength validation
    if (data.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      throw new Error('Password is too short');
    }
    
    if (!/[A-Z]/.test(data.newPassword)) {
      toast.error('Password must contain at least one uppercase letter');
      throw new Error('Password must contain an uppercase letter');
    }
    
    const payload = {
      currentPassword: data.currentPassword.trim(),
      newPassword: data.newPassword.trim()
    };
    
    await updatePasswordMutation.mutateAsync(payload);
    return true;
  };
  
  const handleProfileSubmitClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    handleProfileSubmit(onSubmitProfile)();
  };
  
  const handlePasswordSubmitClick = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Password form submit clicked');
    
    // Trigger validation for all fields
    const isFormValid = await trigger();
    if (!isFormValid) {
      console.log('Form validation failed');
      return false;
    }
    
    // Get the form values directly from react-hook-form
    const formValues = getValues();
    console.log('Submitting form with values:', formValues);
    
    try {
      await onSubmitPassword({
        currentPassword: formValues.currentPassword,
        newPassword: formValues.newPassword,
        confirmPassword: formValues.confirmPassword
      });
      return true;
    } catch (error) {
      console.error('Error in form submission:', error);
      return false;
    }
  };

  const handleLogout = async () => {
    try {
      await auth.logout();
    } finally {
      // Always call logout to ensure the user is logged out client-side
      logout();
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };
  
  const handleCancelEdit = () => {
    resetProfile({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || ''
    });
    setIsEditing(false);
  };
  
  const handleCancelPasswordEdit = () => {
    resetPassword({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setIsPasswordEditing(false);
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="flex items-center mb-8">
        <Link href="/" className="mr-4">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Account Settings</h1>
      </div>
      
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
                  onClick={handleCancelEdit}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleProfileSubmitClick}
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
              <Button variant="outline" size="sm" disabled={!isEditing}>
                Change Photo
              </Button>
            </div>
            
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                {isEditing ? (
                  <Input
                    id="firstName"
                    {...registerProfile('firstName', { required: 'First name is required' })}
                    disabled={updateProfileMutation.isPending}
                  />
                ) : (
                  <div className="px-3 py-2 text-sm">{user?.firstName}</div>
                )}
                {profileErrors.firstName && (
                  <p className="text-sm text-red-500">{profileErrors.firstName.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                {isEditing ? (
                  <Input
                    id="lastName"
                    {...registerProfile('lastName', { required: 'Last name is required' })}
                    disabled={updateProfileMutation.isPending}
                  />
                ) : (
                  <div className="px-3 py-2 text-sm">{user?.lastName}</div>
                )}
                {profileErrors.lastName && (
                  <p className="text-sm text-red-500">{profileErrors.lastName.message}</p>
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
                        {...registerProfile('email', { 
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
                {profileErrors.email && (
                  <p className="text-sm text-red-500">{profileErrors.email.message}</p>
                )}
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
              <Button 
                variant="outline" 
                onClick={() => setIsPasswordEditing(true)}
                data-testid="change-password-button"
                type="button"
              >
                <Pencil className="mr-2 h-4 w-4" /> Change Password
              </Button>
            ) : (
              <div className="space-x-2">
                <Button 
                  variant="outline"
                  onClick={handleCancelPasswordEdit}
                  disabled={updatePasswordMutation.isPending}
                  type="button"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  form="password-form"
                  disabled={updatePasswordMutation.isPending}
                  data-testid="save-password-button"
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
          <form id="password-form" onSubmit={handlePasswordSubmitClick} className="space-y-4">
            <CardContent>
              <div className="grid grid-cols-1 gap-6 max-w-2xl">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword" className="flex items-center">
                    <Lock className="h-4 w-4 mr-2" />
                    Current Password
                  </Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    placeholder="Enter your current password"
                    {...registerPassword('currentPassword', { 
                      required: 'Current password is required',
                      minLength: { value: 1, message: 'Current password is required' }
                    })}
                    disabled={updatePasswordMutation.isPending}
                    data-testid="current-password-input"
                  />
                  {passwordErrors.currentPassword && (
                    <p className="text-sm text-red-500">{passwordErrors.currentPassword.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="flex items-center">
                    <Lock className="h-4 w-4 mr-2" />
                    New Password
                  </Label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="Enter a new password"
                    {...registerPassword('newPassword', { 
                      required: 'New password is required',
                      minLength: { 
                        value: 8, 
                        message: 'Password must be at least 8 characters long' 
                      },
                      validate: (value) => 
                        /[A-Z]/.test(value) || 'Must contain at least one uppercase letter'
                    })}
                    disabled={updatePasswordMutation.isPending}
                    data-testid="new-password-input"
                    autoComplete="new-password"
                  />
                  {passwordErrors.newPassword && (
                    <p className="text-sm text-red-500">{passwordErrors.newPassword.message}</p>
                  )}
                  {newPassword && !passwordErrors.newPassword && (
                    <p className="text-xs text-green-600 flex items-center">
                      <Check className="h-3 w-3 mr-1" /> Password strength: Good
                    </p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="flex items-center">
                    <Lock className="h-4 w-4 mr-2" />
                    Confirm New Password
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your new password"
                    {...registerPassword('confirmPassword', {
                      required: 'Please confirm your new password',
                      validate: (value) =>
                        value === newPassword || 'Passwords do not match',
                    })}
                    disabled={updatePasswordMutation.isPending}
                    data-testid="confirm-password-input"
                    autoComplete="new-password"
                  />
                  {passwordErrors.confirmPassword && (
                    <p className="text-sm text-red-500">
                      {passwordErrors.confirmPassword.message}
                    </p>
                  )}
                  {newPassword && watch('confirmPassword') && !passwordErrors.confirmPassword ? (
                    <p className="text-xs text-green-600 flex items-center">
                      <Check className="h-3 w-3 mr-1" /> Passwords match
                    </p>
                  ) : null}
                </div>
              </div>
            </CardContent>
          </form>
        )}
      </Card>
      
      {/* Danger Zone */}
      <Card className="border-red-100">
        <CardHeader>
          <CardTitle className="text-red-600">Danger Zone</CardTitle>
          <CardDescription>Irreversible and destructive actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
              <div>
                <h4 className="font-medium text-red-800">Logout</h4>
                <p className="text-sm text-red-600">Sign out of your account</p>
              </div>
              <Button variant="destructive" onClick={handleLogout}>
                Logout
              </Button>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
              <div>
                <h4 className="font-medium text-red-800">Delete Account</h4>
                <p className="text-sm text-red-600">Permanently delete your account and all data</p>
              </div>
              <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-50">
                Delete Account
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
