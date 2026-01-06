import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfile();
    } else {
      setProfile(null);
      setLoading(false);
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
    } else {
      setProfile(data);
    }
    setLoading(false);
  };

  const updateProfile = async (updates: { display_name?: string; avatar_url?: string }) => {
    if (!user || !profile) return { error: new Error('No user or profile') };

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('user_id', user.id);

    if (!error) {
      setProfile({ ...profile, ...updates });
    }

    return { error };
  };

  const uploadAvatar = async (file: File) => {
    if (!user) return { error: new Error('No user'), url: null };

    const fileExt = file.name.split('.').pop();
    const filePath = `${user.id}/avatar.${fileExt}`;

    // Delete old avatar if exists
    await supabase.storage.from('avatars').remove([filePath]);

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      return { error: uploadError, url: null };
    }

    // Use signed URL for private bucket (1 hour expiry)
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from('avatars')
      .createSignedUrl(filePath, 3600);

    if (signedUrlError || !signedUrlData?.signedUrl) {
      return { error: signedUrlError || new Error('Failed to create signed URL'), url: null };
    }

    const avatarUrl = signedUrlData.signedUrl;

    // Update profile with new signed avatar URL
    const { error: updateError } = await updateProfile({ avatar_url: avatarUrl });

    return { error: updateError, url: avatarUrl };
  };

  // Helper to refresh avatar URL (for when signed URL expires)
  const refreshAvatarUrl = async () => {
    if (!user || !profile?.avatar_url) return null;
    
    // Extract the file path from the current URL
    const fileExt = profile.avatar_url.includes('.png') ? 'png' : 
                    profile.avatar_url.includes('.jpg') ? 'jpg' : 
                    profile.avatar_url.includes('.jpeg') ? 'jpeg' : 
                    profile.avatar_url.includes('.gif') ? 'gif' : 'png';
    const filePath = `${user.id}/avatar.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('avatars')
      .createSignedUrl(filePath, 3600);
    
    if (error || !data?.signedUrl) return null;
    
    await updateProfile({ avatar_url: data.signedUrl });
    return data.signedUrl;
  };

  return {
    profile,
    loading,
    fetchProfile,
    updateProfile,
    uploadAvatar,
    refreshAvatarUrl,
  };
}
