import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Copy, Check, Key, Webhook, Terminal, Rocket, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

const sampleRequest = `curl -X POST https://api.veriLead.io/v1/maps \\
  -H "Authorization: Bearer sk_live_xxxx..." \\
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
    }
  ]
}`;

const webhookPayload = `{
  "event": "scrape.completed",
  "job_id": "job_abc123",
  "status": "success",
  "results_count": 150,
  "credits_used": 85
}`;

const roles = [
  { value: 'founder', label: 'Founder / CEO' },
  { value: 'developer', label: 'Developer / Engineer' },
  { value: 'product_manager', label: 'Product Manager' },
  { value: 'data_analyst', label: 'Data Analyst' },
  { value: 'marketer', label: 'Marketer / Growth' },
  { value: 'agency', label: 'Agency Owner' },
  { value: 'other', label: 'Other' },
];

const useCases = [
  { value: 'lead_generation', label: 'Lead Generation' },
  { value: 'market_research', label: 'Market Research' },
  { value: 'competitor_analysis', label: 'Competitor Analysis' },
  { value: 'data_enrichment', label: 'Data Enrichment' },
  { value: 'automation', label: 'Workflow Automation' },
  { value: 'app_integration', label: 'App / Integration Building' },
  { value: 'academic', label: 'Academic Research' },
  { value: 'other', label: 'Other' },
];

export default function Developer() {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [earlyAccessOpen, setEarlyAccessOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    useCase: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const copyToClipboard = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    toast({ title: 'Copied to clipboard' });
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const handleEarlyAccessSubmit = async () => {
    if (!formData.name || !formData.email || !formData.role || !formData.useCase) {
      toast({
        title: 'Missing information',
        description: 'Please fill out all fields.',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);

    // Simulate API call - in production, this would send to your backend
    await new Promise(resolve => setTimeout(resolve, 1000));

    toast({
      title: 'Request submitted!',
      description: 'We\'ll notify you when API access is available.',
    });

    setEarlyAccessOpen(false);
    setFormData({ name: '', email: '', role: '', useCase: '' });
    setSubmitting(false);
  };

  return (
    <DashboardLayout>
      <div className="relative">
        {/* Coming Soon Overlay */}
        <div className="fixed inset-0 z-40 flex items-center justify-center pointer-events-none" style={{ top: '64px' }}>
          <div className="text-center pointer-events-auto">
            <div className="glass rounded-2xl p-8 border border-primary/20 shadow-2xl max-w-md mx-4">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Developer API Coming Soon</h2>
              <p className="text-muted-foreground mb-6">
                We're working hard to bring you powerful API access. Be the first to know when it launches!
              </p>
              <Button onClick={() => setEarlyAccessOpen(true)} variant="hero" size="lg" className="group">
                <Rocket className="w-4 h-4" />
                Request Early Access
              </Button>
            </div>
          </div>
        </div>

        {/* Blurred Background Content */}
        <div className="container mx-auto px-4 py-8 max-w-4xl blur-sm opacity-50 pointer-events-none select-none">
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
                <p className="text-sm text-muted-foreground">Authenticate your API requests</p>
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
              </div>
              <pre className="bg-background rounded-xl p-4 overflow-x-auto text-sm font-mono text-muted-foreground">
                {sampleRequest}
              </pre>
            </div>

            {/* Response */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Response</span>
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
                <p className="text-sm text-muted-foreground">Receive notifications</p>
              </div>
            </div>

            <p className="text-muted-foreground mb-4">
              Configure a webhook URL to receive notifications when scrape jobs complete.
            </p>

            <div className="flex gap-3 mb-6">
              <Input
                type="url"
                placeholder="https://your-app.com/webhooks/veriLead"
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
              </div>
              <pre className="bg-background rounded-xl p-4 overflow-x-auto text-sm font-mono text-muted-foreground">
                {webhookPayload}
              </pre>
            </div>
          </div>
        </div>

        {/* Early Access Request Dialog */}
        <Dialog open={earlyAccessOpen} onOpenChange={setEarlyAccessOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Request Early Access</DialogTitle>
              <DialogDescription>
                Be among the first to get API access when we launch.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={formData.role} onValueChange={(v) => setFormData({ ...formData, role: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>How will you use the API?</Label>
                <Select value={formData.useCase} onValueChange={(v) => setFormData({ ...formData, useCase: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select use case" />
                  </SelectTrigger>
                  <SelectContent>
                    {useCases.map((uc) => (
                      <SelectItem key={uc.value} value={uc.value}>
                        {uc.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setEarlyAccessOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEarlyAccessSubmit} disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Request'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
