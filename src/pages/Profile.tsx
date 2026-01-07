import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useProfile } from '@/hooks/useProfile';
import { useApp } from '@/contexts/AppContext';
import { supabase } from '@/integrations/supabase/client';
import { Camera, Loader2, User, Lock, AlertTriangle } from 'lucide-react';

export default function Profile() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated, authLoading, user } = useApp();
  const { profile, loading, updateProfile, uploadAvatar } = useProfile();

  const [displayName, setDisplayName] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Password change state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  // Delete account state
  const [deleting, setDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Check if user is email/password or OAuth
  const isOAuthUser = user?.app_metadata?.provider === 'google' ||
    user?.app_metadata?.providers?.includes('google');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/auth');
    }
  }, [isAuthenticated, authLoading, navigate]);

  useEffect(() => {
    if (profile?.display_name) {
      setDisplayName(profile.display_name);
    }
  }, [profile]);

  const handleSaveProfile = async () => {
    setSaving(true);
    const { error } = await updateProfile({ display_name: displayName });
    setSaving(false);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to update profile.',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Profile updated',
        description: 'Your display name has been saved.',
      });
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file',
        description: 'Please select an image file.',
        variant: 'destructive',
      });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please select an image under 2MB.',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);
    const { error } = await uploadAvatar(file);
    setUploading(false);

    if (error) {
      toast({
        title: 'Upload failed',
        description: 'Failed to upload avatar.',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Avatar updated',
        description: 'Your avatar has been uploaded.',
      });
    }
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      toast({
        title: 'Password too short',
        description: 'Password must be at least 6 characters.',
        variant: 'destructive',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: 'Passwords do not match',
        description: 'Please make sure your passwords match.',
        variant: 'destructive',
      });
      return;
    }

    setChangingPassword(true);
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    setChangingPassword(false);

    if (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update password.',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Password updated',
        description: 'Your password has been changed successfully.',
      });
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);

    // Soft delete by updating profile with deleted_at timestamp
    const { error } = await supabase
      .from('profiles')
      .update({ deleted_at: new Date().toISOString() } as any)
      .eq('user_id', user?.id);

    if (error) {
      setDeleting(false);
      toast({
        title: 'Error',
        description: 'Failed to delete account. Please try again.',
        variant: 'destructive',
      });
      return;
    }

    // Sign out the user
    await supabase.auth.signOut();

    toast({
      title: 'Account deleted',
      description: 'Your account has been deactivated.',
    });

    navigate('/auth');
  };

  if (authLoading || loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  const initials = displayName
    ? displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.charAt(0).toUpperCase() || 'U';

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Profile Settings</h1>
          <p className="text-muted-foreground">Manage your account details</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Avatar</CardTitle>
            <CardDescription>Click to upload a new profile picture</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
                <Avatar className="w-24 h-24 border-2 border-border">
                  <AvatarImage src={profile?.avatar_url || undefined} alt="Avatar" />
                  <AvatarFallback className="text-2xl bg-primary/10">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  {uploading ? (
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                  ) : (
                    <Camera className="w-6 h-6 text-white" />
                  )}
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                <p>Recommended: Square image, at least 200x200px</p>
                <p>Max file size: 2MB</p>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Display Name</CardTitle>
            <CardDescription>This is how you'll appear across the app</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">Name</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your display name"
              />
            </div>
            <Button onClick={handleSaveProfile} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Email</CardTitle>
            <CardDescription>Your account email address</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">{user?.email}</span>
            </div>
          </CardContent>
        </Card>

        {/* Security - Change Password (only for email/password users) */}
        {!isOAuthUser && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Security
              </CardTitle>
              <CardDescription>Update your password</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                />
              </div>
              <Button
                onClick={handleChangePassword}
                disabled={changingPassword || !newPassword || !confirmPassword}
              >
                {changingPassword ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Change Password'
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Danger Zone - Delete Account */}
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              Danger Zone
            </CardTitle>
            <CardDescription>Irreversible account actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 rounded-lg bg-destructive/10 border border-destructive/20">
              <div>
                <p className="font-medium">Delete Account</p>
                <p className="text-sm text-muted-foreground">Permanently disable your account</p>
              </div>
              <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    Delete Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action will deactivate your account. You will be signed out and
                      won't be able to access your account anymore. Your data will be retained
                      for potential recovery.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAccount}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      disabled={deleting}
                    >
                      {deleting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        'Yes, delete my account'
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
