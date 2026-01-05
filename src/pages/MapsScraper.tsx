import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { useApp } from '@/contexts/AppContext';
import { useToast } from '@/hooks/use-toast';
import { Map, Loader2, ChevronDown, ChevronUp, Zap, Info, ShieldCheck, Layers } from 'lucide-react';
import { ScraperResult } from '@/types/scraper';

export default function MapsScraper() {
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [maxResults, setMaxResults] = useState(20);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const { setResults, addActivity, credits, setCredits } = useApp();
  const navigate = useNavigate();
  const { toast } = useToast();

  const estimatedCost = Math.ceil(maxResults * 0.5) + (verifiedOnly ? 10 : 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!category.trim() || !location.trim()) {
      toast({
        title: 'Missing fields',
        description: 'Please enter both category and location.',
        variant: 'destructive',
      });
      return;
    }

    if (credits < estimatedCost) {
      toast({
        title: 'Insufficient credits',
        description: 'Please add more credits to continue.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setProgress(0);

    // Simulate progress while waiting for response
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 15;
      });
    }, 500);

    try {
      // Use different webhook based on verified toggle
      const webhookUrl = verifiedOnly
        ? 'https://maddy264m.app.n8n.cloud/webhook-test/scrape-companies-validation'
        : 'https://maddy264m.app.n8n.cloud/webhook/scrape-companies';

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category: category.trim(),
          location: location.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error('Scrape failed');
      }

      const data = await response.json();
      
      // Log the raw response for debugging
      console.log('Webhook response:', data);
      
      // Map webhook response to ScraperResult format
      // Handles various field naming conventions from n8n workflows
      const results: ScraperResult[] = Array.isArray(data) 
        ? data.map((item: any) => ({
            company_name: item.company_name || item.companyName || item.name || item.title || item.business_name || item.businessName || '—',
            verified: item.verified ?? item.is_verified ?? item.isVerified ?? false,
            phone: item.phone || item.phone_number || item.phoneNumber || item.telephone || null,
            email: item.email || item.emailAddress || item.email_address || null,
            website: item.website || item.url || item.site || item.web || item.link || null,
            rating: item.rating ? Number(item.rating) : (item.stars ? Number(item.stars) : null),
            rating_count: item.rating_count || item.ratingCount || item.reviews_count || item.reviewsCount || item.review_count || item.reviewCount || item.totalReviews || null,
          }))
        : [];

      setProgress(100);
      clearInterval(progressInterval);

      if (results.length === 0) {
        toast({
          title: 'No results found',
          description: 'Try a different category or location.',
          variant: 'destructive',
        });
        setIsLoading(false);
        setProgress(0);
        return;
      }

      setResults(results);
      setCredits(credits - estimatedCost);
      addActivity({
        type: 'scrape',
        description: `Maps Scraper - "${category}" in "${location}"`,
        credits_used: estimatedCost,
      });

      toast({
        title: 'Scrape complete!',
        description: `Found ${results.length} results.`,
      });

      navigate('/results');
    } catch (error) {
      console.error('Scrape error:', error);
      clearInterval(progressInterval);
      toast({
        title: 'Scrape failed',
        description: 'Could not reach the scraping service. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setProgress(0);
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="mb-8 animate-in">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Map className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Maps Scraper</h1>
              <p className="text-muted-foreground text-sm">Extract business data from Google Maps</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="glass rounded-2xl p-6 space-y-6 animate-in" style={{ animationDelay: '100ms' }}>
            {/* Category */}
            <div>
              <label className="text-sm font-medium mb-2 block">Business Category</label>
              <Input
                placeholder="e.g., Restaurants, Coffee shops, Dentists"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={isLoading}
              />
            </div>

            {/* Location */}
            <div>
              <label className="text-sm font-medium mb-2 block">Location</label>
              <Input
                placeholder="e.g., New York, NY or 90210"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                disabled={isLoading}
              />
            </div>

            {/* Advanced Options Toggle */}
            <button
              type="button"
              onClick={() => setShowOptions(!showOptions)}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {showOptions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              Advanced Options
            </button>

            {/* Advanced Options */}
            {showOptions && (
              <div className="space-y-4 pt-2 border-t border-border">
                <div>
                  <label className="text-sm font-medium mb-2 block">Max Results</label>
                  <Input
                    type="number"
                    min={10}
                    max={500}
                    value={maxResults}
                    onChange={(e) => setMaxResults(Number(e.target.value))}
                    disabled={isLoading}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Verified Only</label>
                    <p className="text-xs text-muted-foreground">Only return verified businesses (+10 credits)</p>
                  </div>
                  <Switch
                    checked={verifiedOnly}
                    onCheckedChange={setVerifiedOnly}
                    disabled={isLoading}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Cost Estimation */}
          <div className="glass rounded-xl p-4 flex items-center justify-between animate-in" style={{ animationDelay: '200ms' }}>
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Estimated cost</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              <span className="font-semibold">{estimatedCost} credits</span>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="glow"
            size="xl"
            className="w-full animate-in"
            style={{ animationDelay: '300ms' }}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Scraping...</span>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                  verifiedOnly 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                    : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                }`}>
                  {verifiedOnly ? <ShieldCheck className="w-3 h-3" /> : <Layers className="w-3 h-3" />}
                  {verifiedOnly ? 'Verified' : 'Standard'}
                </span>
              </div>
            ) : (
              <>
                <Map className="w-5 h-5" />
                Start Scraping
              </>
            )}
          </Button>

          {/* Progress Bar */}
          {isLoading && (
            <div className="space-y-2 animate-in">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground text-center">
                {progress < 30 && 'Connecting to scraper...'}
                {progress >= 30 && progress < 60 && 'Fetching business data...'}
                {progress >= 60 && progress < 90 && 'Processing results...'}
                {progress >= 90 && 'Almost done...'}
              </p>
            </div>
          )}
        </form>
      </div>
    </DashboardLayout>
  );
}
