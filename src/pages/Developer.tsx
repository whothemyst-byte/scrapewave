import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, Check, Key, Webhook, Terminal } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

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

export default function Developer() {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const { toast } = useToast();

  const copyToClipboard = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    toast({
      title: 'Copied to clipboard',
    });
    setTimeout(() => setCopiedSection(null), 2000);
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
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Key className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">API Key</h2>
              <p className="text-sm text-muted-foreground">Use this key to authenticate your API requests</p>
            </div>
          </div>

          <div className="flex gap-3">
            <Input
              type="password"
              value="sk_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              readOnly
              className="font-mono"
            />
            <Button variant="outline" disabled>
              <Copy className="w-4 h-4" />
              Copy
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            API key generation coming soon. Contact support for early access.
          </p>
        </div>

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
