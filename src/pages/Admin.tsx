import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { useApp } from '@/contexts/AppContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Shield, Zap, Search, UserCog } from 'lucide-react';

interface UserCreditsInfo {
  user_id: string;
  balance: number;
  email?: string;
}

export default function Admin() {
  const { isAdmin, loading: adminLoading } = useIsAdmin();
  const { authLoading } = useApp();
  const { toast } = useToast();

  const [searchEmail, setSearchEmail] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserCreditsInfo | null>(null);
  const [newBalance, setNewBalance] = useState('');
  const [searching, setSearching] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Clear selected user when search changes
  useEffect(() => {
    setSelectedUser(null);
    setNewBalance('');
  }, [searchEmail]);

  const handleSearch = async () => {
    if (!searchEmail.trim()) {
      toast({ title: 'Enter an email', variant: 'destructive' });
      return;
    }

    setSearching(true);
    try {
      // Search for user by email via edge function (admin-only)
      const { data, error } = await supabase.functions.invoke('admin-search-user', {
        body: { email: searchEmail.trim() },
      });

      if (error) throw error;

      if (!data.success) {
        toast({ title: data.message || 'User not found', variant: 'destructive' });
        setSelectedUser(null);
        return;
      }

      setSelectedUser({
        user_id: data.user_id,
        balance: data.balance,
        email: data.email,
      });
      setNewBalance(data.balance.toString());
    } catch (err) {
      console.error('Search error:', err);
      toast({ title: 'Failed to search user', variant: 'destructive' });
    } finally {
      setSearching(false);
    }
  };

  const handleUpdateCredits = async () => {
    if (!selectedUser) return;

    const balance = parseInt(newBalance, 10);
    if (isNaN(balance) || balance < 0) {
      toast({ title: 'Enter a valid balance (0 or more)', variant: 'destructive' });
      return;
    }

    setUpdating(true);
    try {
      const { data, error } = await supabase.rpc('admin_set_credits', {
        p_target_user_id: selectedUser.user_id,
        p_new_balance: balance,
      });

      if (error) throw error;

      const result = data?.[0];
      if (!result?.success) {
        toast({ title: result?.message || 'Failed to update credits', variant: 'destructive' });
        return;
      }

      toast({ title: `Credits updated to ${balance.toLocaleString()}` });
      setSelectedUser({ ...selectedUser, balance });
    } catch (err) {
      console.error('Update error:', err);
      toast({ title: 'Failed to update credits', variant: 'destructive' });
    } finally {
      setUpdating(false);
    }
  };

  // Loading state
  if (authLoading || adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Not admin - redirect
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8 animate-in">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-destructive/10 text-destructive mb-4">
            <Shield className="w-4 h-4" />
            <span className="text-sm font-medium">Admin Only</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">Credit Management</h1>
          <p className="text-muted-foreground">
            Modify user credit balances for testing purposes
          </p>
        </div>

        {/* Search User */}
        <div className="glass rounded-2xl p-6 mb-6 animate-in" style={{ animationDelay: '100ms' }}>
          <div className="flex items-center gap-2 mb-4">
            <UserCog className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Find User</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">User Email</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="email"
                  type="email"
                  placeholder="user@example.com"
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button onClick={handleSearch} disabled={searching}>
                  {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* User Details & Update */}
        {selectedUser && (
          <div className="glass rounded-2xl p-6 animate-in" style={{ animationDelay: '200ms' }}>
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">User Credits</h2>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-secondary/50 border border-border">
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{selectedUser.email}</p>
              </div>

              <div className="p-4 rounded-lg bg-secondary/50 border border-border">
                <p className="text-sm text-muted-foreground">Current Balance</p>
                <p className="font-medium text-lg flex items-center gap-1">
                  <Zap className="w-4 h-4 text-primary" />
                  {selectedUser.balance.toLocaleString()} credits
                </p>
              </div>

              <div>
                <Label htmlFor="newBalance">New Balance</Label>
                <Input
                  id="newBalance"
                  type="number"
                  min="0"
                  placeholder="Enter new balance"
                  value={newBalance}
                  onChange={(e) => setNewBalance(e.target.value)}
                  className="mt-1"
                />
              </div>

              <Button
                onClick={handleUpdateCredits}
                disabled={updating}
                className="w-full"
                variant="hero"
              >
                {updating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Credits'
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
