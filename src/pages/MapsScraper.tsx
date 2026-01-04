import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useApp } from '@/contexts/AppContext';
import { useToast } from '@/hooks/use-toast';
import { Map, Loader2, ChevronDown, ChevronUp, Zap, Info } from 'lucide-react';
import { ScraperResult } from '@/types/scraper';

export default function MapsScraper() {
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [maxResults, setMaxResults] = useState(50);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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

    try {
      // Simulate webhook call
      // In production, replace with actual webhook URL
      const response = await fetch('https://httpbin.org/post', {
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

      // Generate mock results for demo
      const mockResults: ScraperResult[] = Array.from({ length: maxResults }, (_, i) => ({
        company_name: `${category} Business ${i + 1}`,
        verified: verifiedOnly || Math.random() > 0.3,
        phone: Math.random() > 0.2 ? `+1 (555) ${String(Math.floor(Math.random() * 900) + 100)}-${String(Math.floor(Math.random() * 9000) + 1000)}` : null,
        email: Math.random() > 0.3 ? `contact@business${i + 1}.com` : null,
        website: Math.random() > 0.2 ? `https://business${i + 1}.com` : null,
        rating: Math.random() > 0.1 ? Number((Math.random() * 2 + 3).toFixed(1)) : null,
        rating_count: Math.random() > 0.1 ? Math.floor(Math.random() * 500) + 10 : null,
      }));

      setResults(mockResults);
      setCredits(credits - estimatedCost);
      addActivity({
        type: 'scrape',
        description: `Maps Scraper - "${category}" in "${location}"`,
        credits_used: estimatedCost,
      });

      toast({
        title: 'Scrape complete!',
        description: `Found ${mockResults.length} results.`,
      });

      navigate('/results');
    } catch (error) {
      toast({
        title: 'Scrape failed',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
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
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Scraping...
              </>
            ) : (
              <>
                <Map className="w-5 h-5" />
                Start Scraping
              </>
            )}
          </Button>
        </form>
      </div>
    </DashboardLayout>
  );
}
