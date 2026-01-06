import { useState } from 'react';
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
import { supabase } from '@/integrations/supabase/client';

export default function MapsScraper() {
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [maxResults, setMaxResults] = useState(20);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const { setResults, addActivity, credits, updateCredits } = useApp();
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

    // Client-side check is just for UX - real validation happens server-side
    if (credits !== null && credits < estimatedCost) {
      toast({
        title: 'Insufficient credits',
        description: 'Please add more credits to continue.',
        variant: 'destructive',
      });
      return;
    }

    // Validate input length client-side for UX
    if (category.trim().length > 100) {
      toast({
        title: 'Category too long',
        description: 'Please use a shorter category name (max 100 characters).',
        variant: 'destructive',
      });
      return;
    }

    if (location.trim().length > 200) {
      toast({
        title: 'Location too long',
        description: 'Please use a shorter location (max 200 characters).',
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
      // Call the secure edge function instead of direct webhook
      const { data: response, error: invokeError } = await supabase.functions.invoke('scrape-proxy', {
        body: {
          category: category.trim(),
          location: location.trim(),
          maxResults: maxResults,
          verifiedOnly: verifiedOnly,
        },
      });

      if (invokeError) {
        throw new Error(invokeError.message || 'Scrape failed');
      }

      if (!response) {
        throw new Error('No response from server');
      }

      // Handle insufficient credits response
      if (response.error) {
        if (response.error === 'Insufficient credits') {
          toast({
            title: 'Insufficient credits',
            description: 'Please add more credits to continue.',
            variant: 'destructive',
          });
          if (response.currentBalance !== undefined) {
            updateCredits(response.currentBalance);
          }
          setIsLoading(false);
          setProgress(0);
          return;
        }
        throw new Error(response.error);
      }

      const data = response.results;

      // Update credits with the new balance from server
      if (response.newBalance !== undefined) {
        updateCredits(response.newBalance);
      }

      // Map webhook response to ScraperResult format
      // Supports both our internal keys and the current n8n output keys (e.g. "Business Name")
      const results: ScraperResult[] = Array.isArray(data)
        ? data.map((item: any) => {
            const companyName =
              item.company_name ??
              item.companyName ??
              item.business_name ??
              item.businessName ??
              item.name ??
              item.title ??
              item['Business Name'] ??
              '—';

            const verificationRaw =
              item.verified ?? item.is_verified ?? item.isVerified ?? item.Verification ?? item['Verification'];

            const verified =
              typeof verificationRaw === 'boolean'
                ? verificationRaw
                : typeof verificationRaw === 'string'
                  ? verificationRaw.toLowerCase().includes('verified')
                  : false;

            const phone =
              item.phone ?? item.phone_number ?? item.phoneNumber ?? item.telephone ?? item['Phone Number'] ?? null;

            const email = item.email ?? item.emailAddress ?? item.email_address ?? null;

            const website =
              item.website ?? item.url ?? item.site ?? item.web ?? item.link ?? item['Website'] ?? null;

            const rating =
              item.rating != null
                ? Number(item.rating)
                : item.stars != null
                  ? Number(item.stars)
                  : item['Rating'] != null
                    ? Number(item['Rating'])
                    : null;

            const ratingCountRaw =
              item.rating_count ??
              item.ratingCount ??
              item.reviews_count ??
              item.reviewsCount ??
              item.review_count ??
              item.reviewCount ??
              item.totalReviews ??
              item['Rating Count'] ??
              null;

            const rating_count = ratingCountRaw != null ? Number(ratingCountRaw) : null;

            return {
              company_name: companyName,
              verified,
              phone,
              email,
              website,
              rating: Number.isFinite(rating as number) ? rating : null,
              rating_count: Number.isFinite(rating_count as number) ? rating_count : null,
            };
          })
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
      // Credits are already updated by the server response earlier in the flow
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
                {Math.round(progress)}%
                <span className="mx-2">•</span>
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
