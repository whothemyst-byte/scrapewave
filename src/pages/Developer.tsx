import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Copy, Check, Key, Webhook, Terminal, Plus, Trash2, Loader2, Eye, EyeOff } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useApp } from '@/contexts/AppContext';
import { supabase } from '@/integrations/supabase/client';

interface ApiKey {
  id: string;
  key_prefix: string;
  name: string;
  created_at: string;
  last_used_at: string | null;
  revoked_at: string | null;
}

const sampleRequest = `curl -X POST https://api.scrapewave.io/v1/maps \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "category": "Restaurants",
    "location": "New York, NY"
  }'`;

const sampleResponse = `{
  "success": true,
  "credits_used": 35,
  "results": [
    {
      "company_name": "Joe's Pizza",
      "verified": true,
      "phone": "+1 (212) 555-0123",
      "email": "info@joespizza.com",
      "website": "https://joespizza.com",
      "rating": 4.5,
      "rating_count": 1247
    },
    // ... more results
  ]
}`;

const webhookPayload = `{
  "event": "scrape.completed",
  "job_id": "job_abc123",
  "status": "success",
  "results_count": 150,
  "credits_used": 85,
  "timestamp": "2024-01-15T10:30:00Z"
}`;

// Simple hash function for API key (in production, use a proper crypto library)
async function hashApiKey(key: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Generate a random API key
function generateApiKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = 'sk_live_';
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export default function Developer() {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [newKeyDialogOpen, setNewKeyDialogOpen] = useState(false);
  const [newlyGeneratedKey, setNewlyGeneratedKey] = useState<string | null>(null);
  const [showNewKey, setShowNewKey] = useState(false);
  const [tableNotReady, setTableNotReady] = useState(false);
  const { toast } = useToast();
  const { user } = useApp();

  // Fetch API keys on mount
  useEffect(() => {
    if (user) {
      fetchApiKeys();
    }
  }, [user]);

  const fetchApiKeys = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('api_keys')
        .select('*')
        .eq('user_id', user?.id)
        .is('revoked_at', null)
        .order('created_at', { ascending: false });

      if (error) {
        // Check if the table doesn't exist yet
        if (error.message?.includes('relation') && error.message?.includes('does not exist')) {
          setTableNotReady(true);
        } else {
          console.error('Error fetching API keys:', error);
        }
      } else {
        setTableNotReady(false);
        setApiKeys(data || []);
      }
    } catch (err) {
      console.error('Error:', err);
    }
    setLoading(false);
  };

  const handleGenerateKey = async () => {
    if (!user) return;

    setGenerating(true);

    try {
      // Generate a new key
      const newKey = generateApiKey();
      const keyHash = await hashApiKey(newKey);
      const keyPrefix = newKey.substring(0, 16) + '...';

      // Store the key hash in the database
      const { error } = await supabase
        .from('api_keys')
        .insert({
          user_id: user.id,
          key_hash: keyHash,
          key_prefix: keyPrefix,
          name: 'Default',
        });

      if (error) {
        throw error;
      }

      // Show the new key to the user (only once!)
      setNewlyGeneratedKey(newKey);
      setNewKeyDialogOpen(true);

      // Refresh the list
      fetchApiKeys();

      toast({
        title: 'API key generated',
        description: 'Make sure to copy your key now. You won\'t be able to see it again!',
      });
    } catch (error: any) {
      console.error('Error generating API key:', error);

      // Check if the table doesn't exist yet
      if (error?.message?.includes('relation') && error?.message?.includes('does not exist')) {
        setTableNotReady(true);
        toast({
          title: 'Setup Required',
          description: 'Please run the database migration first.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to generate API key. Please try again.',
          variant: 'destructive',
        });
      }
    } finally {
      setGenerating(false);
    }
  };

  const handleRevokeKey = async (keyId: string) => {
    const { error } = await supabase
      .from('api_keys')
      .update({ revoked_at: new Date().toISOString() })
      .eq('id', keyId);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to revoke API key.',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'API key revoked',
        description: 'The API key has been revoked and can no longer be used.',
      });
      fetchApiKeys();
    }
  };

  const copyToClipboard = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    toast({
      title: 'Copied to clipboard',
    });
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const handleCloseNewKeyDialog = () => {
    setNewKeyDialogOpen(false);
    setNewlyGeneratedKey(null);
    setShowNewKey(false);
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8 animate-in">
          <h1 className="text-3xl font-bold mb-2">Developer</h1>
          <p className="text-muted-foreground">
            API documentation and integration guides
          </p>
        </div>

        {/* API Key Section */}
        <div className="glass rounded-2xl p-6 mb-8 animate-in" style={{ animationDelay: '100ms' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Key className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">API Keys</h2>
                <p className="text-sm text-muted-foreground">Manage your API keys for authentication</p>
              </div>
            </div>
            <Button onClick={handleGenerateKey} disabled={generating}>
              {generating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              Generate New Key
            </Button>
          </div>

          {/* API Keys List */}
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : tableNotReady ? (
            <div className="text-center py-8 px-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <Key className="w-12 h-12 mx-auto mb-3 text-yellow-500" />
              <p className="font-medium text-yellow-600 mb-2">Setup Required</p>
              <p className="text-sm text-muted-foreground mb-4">
                The API keys feature requires a database migration. Please run the migration SQL in your Supabase dashboard.
              </p>
              <code className="text-xs text-muted-foreground block bg-background p-2 rounded">
                supabase/migrations/20260107120000_soft_delete_and_api_keys.sql
              </code>
            </div>
          ) : apiKeys.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Key className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No API keys yet. Generate one to get started.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {apiKeys.map((key) => (
                <div
                  key={key.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-background border border-border"
                >
                  <div className="flex items-center gap-4">
                    <code className="text-sm font-mono text-muted-foreground">
                      {key.key_prefix}
                    </code>
                    <Badge variant="secondary">{key.name}</Badge>
                    <span className="text-xs text-muted-foreground">
                      Created {new Date(key.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Revoke API Key?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. Any applications using this key will stop working immediately.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleRevokeKey(key.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Revoke Key
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* New Key Dialog */}
        <Dialog open={newKeyDialogOpen} onOpenChange={handleCloseNewKeyDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Your New API Key</DialogTitle>
              <DialogDescription>
                Copy this key now. For security reasons, you won't be able to see it again.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  type={showNewKey ? 'text' : 'password'}
                  value={newlyGeneratedKey || ''}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShowNewKey(!showNewKey)}
                >
                  {showNewKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => newlyGeneratedKey && copyToClipboard(newlyGeneratedKey, 'newKey')}
                >
                  {copiedSection === 'newKey' ? (
                    <Check className="w-4 h-4 text-success" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Store this key securely. Never share it or commit it to version control.
              </p>
            </div>
          </DialogContent>
        </Dialog>

        {/* API Usage */}
        <div className="glass rounded-2xl p-6 mb-8 animate-in" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Terminal className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">API Usage</h2>
              <p className="text-sm text-muted-foreground">Example request and response</p>
            </div>
          </div>

          {/* Request */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Request</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(sampleRequest, 'request')}
              >
                {copiedSection === 'request' ? (
                  <Check className="w-4 h-4 text-success" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
            <pre className="bg-background rounded-xl p-4 overflow-x-auto text-sm font-mono text-muted-foreground">
              {sampleRequest}
            </pre>
          </div>

          {/* Response */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Response</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(sampleResponse, 'response')}
              >
                {copiedSection === 'response' ? (
                  <Check className="w-4 h-4 text-success" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
            <pre className="bg-background rounded-xl p-4 overflow-x-auto text-sm font-mono text-muted-foreground">
              {sampleResponse}
            </pre>
          </div>
        </div>

        {/* Webhooks */}
        <div className="glass rounded-2xl p-6 animate-in" style={{ animationDelay: '300ms' }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Webhook className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Webhooks</h2>
              <p className="text-sm text-muted-foreground">Receive real-time notifications</p>
            </div>
          </div>

          <p className="text-muted-foreground mb-4">
            Configure a webhook URL to receive notifications when scrape jobs complete.
          </p>

          <div className="flex gap-3 mb-6">
            <Input
              type="url"
              placeholder="https://your-app.com/webhooks/scrapewave"
              className="font-mono text-sm"
            />
            <Button variant="outline" disabled>
              Save
            </Button>
          </div>

          {/* Webhook Payload */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Example Payload</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(webhookPayload, 'webhook')}
              >
                {copiedSection === 'webhook' ? (
                  <Check className="w-4 h-4 text-success" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
            <pre className="bg-background rounded-xl p-4 overflow-x-auto text-sm font-mono text-muted-foreground">
              {webhookPayload}
            </pre>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
