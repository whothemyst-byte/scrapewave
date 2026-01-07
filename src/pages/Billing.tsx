import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { useApp } from '@/contexts/AppContext';
import { Zap, Check, Star, Building2, Rocket, Calculator } from 'lucide-react';
import { PricingTier } from '@/types/scraper';
import { useState } from 'react';

const pricingTiers: PricingTier[] = [
  {
    name: 'Starter',
    price: 19,
    credits: 1000,
    description: 'Perfect for side projects and testing',
    features: [
      '1,000 credits/month',
      'Maps Scraper access',
      'CSV & JSON exports',
      'Email support',
    ],
  },
  {
    name: 'Creator',
    price: 49,
    credits: 5000,
    description: 'For indie hackers and small teams',
    features: [
      '5,000 credits/month',
      'All scraper modules',
      'Priority processing',
      'API access',
      'Webhook notifications',
    ],
    popular: true,
  },
  {
    name: 'Agency',
    price: 149,
    credits: 20000,
    description: 'For agencies and power users',
    features: [
      '20,000 credits/month',
      'Unlimited team members',
      'Custom integrations',
      'Dedicated support',
      'SLA guarantee',
    ],
  },
  {
    name: 'Enterprise',
    price: 0,
    credits: 0,
    description: 'Custom solutions for large organizations',
    features: [
      'Unlimited credits',
      'Custom scraping modules',
      'On-premise deployment',
      'Dedicated account manager',
      '24/7 priority support',
    ],
  },
];

const creditBreakdown = [
  { action: 'Base scrape cost', cost: 10, description: 'Starting cost for any scrape job' },
  { action: 'Per result', cost: 0.5, description: 'Cost per result returned' },
  { action: 'Verification', cost: 10, description: 'Additional cost for verified-only results' },
  { action: 'Export (CSV/JSON)', cost: 5, description: 'Cost per export' },
];

// Interactive Credits Calculator Component
function CreditsCalculator() {
  const [resultCount, setResultCount] = useState(50);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [includeExport, setIncludeExport] = useState(true);

  // Calculate costs
  const baseCost = 10;
  const perResultCost = resultCount * 0.5;
  const verificationCost = verifiedOnly ? 10 : 0;
  const exportCost = includeExport ? 5 : 0;
  const totalCost = Math.ceil(baseCost + perResultCost + verificationCost + exportCost);

  // Monthly estimate (assuming 10 scrapes per month)
  const monthlyEstimate = totalCost * 10;

  // Recommend a plan
  const recommendedPlan = monthlyEstimate <= 1000 ? 'Starter'
    : monthlyEstimate <= 5000 ? 'Creator'
      : 'Agency';

  return (
    <div className="glass rounded-2xl p-6 mb-16 animate-in" style={{ animationDelay: '350ms' }}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Calculator className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Credits Calculator</h2>
          <p className="text-sm text-muted-foreground">Estimate your scraping costs</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Controls */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium">Number of Results</label>
              <span className="text-sm font-bold text-primary">{resultCount}</span>
            </div>
            <Slider
              value={[resultCount]}
              onValueChange={(v) => setResultCount(v[0])}
              min={10}
              max={500}
              step={10}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>10</span>
              <span>500</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
            <div>
              <p className="font-medium text-sm">Verified Results Only</p>
              <p className="text-xs text-muted-foreground">Higher quality, +10 credits</p>
            </div>
            <Switch checked={verifiedOnly} onCheckedChange={setVerifiedOnly} />
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
            <div>
              <p className="font-medium text-sm">Include Export</p>
              <p className="text-xs text-muted-foreground">CSV or JSON, +5 credits</p>
            </div>
            <Switch checked={includeExport} onCheckedChange={setIncludeExport} />
          </div>
        </div>

        {/* Results */}
        <div className="bg-background rounded-xl p-6 border border-border">
          <h3 className="font-semibold mb-4">Cost Breakdown</h3>
          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Base cost</span>
              <span>{baseCost} credits</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{resultCount} results × 0.5</span>
              <span>{perResultCost} credits</span>
            </div>
            {verifiedOnly && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Verification</span>
                <span>{verificationCost} credits</span>
              </div>
            )}
            {includeExport && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Export</span>
                <span>{exportCost} credits</span>
              </div>
            )}
            <div className="border-t border-border pt-3 flex justify-between font-semibold">
              <span>Total per scrape</span>
              <span className="text-primary flex items-center gap-1">
                <Zap className="w-4 h-4" />
                {totalCost} credits
              </span>
            </div>
          </div>

          <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
            <p className="text-xs text-muted-foreground mb-1">Monthly estimate (10 scrapes)</p>
            <p className="text-2xl font-bold text-primary">{monthlyEstimate.toLocaleString()} credits</p>
            <p className="text-xs text-muted-foreground mt-2">
              We recommend the <span className="font-semibold text-foreground">{recommendedPlan}</span> plan
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Billing() {
  const { credits, isAuthenticated } = useApp();

  const TierIcon = ({ name }: { name: string }) => {
    switch (name) {
      case 'Starter':
        return <Zap className="w-5 h-5" />;
      case 'Creator':
        return <Star className="w-5 h-5" />;
      case 'Agency':
        return <Rocket className="w-5 h-5" />;
      case 'Enterprise':
        return <Building2 className="w-5 h-5" />;
      default:
        return <Zap className="w-5 h-5" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12 animate-in">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Simple, credit-based pricing</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Pay for what you use. No hidden fees, no surprises.
          </p>
          {isAuthenticated && (
            <div className="inline-flex items-center gap-2 mt-6 px-4 py-2 rounded-full bg-secondary border border-border">
              <Zap className="w-5 h-5 text-primary" />
              <span className="font-semibold">{(credits ?? 0).toLocaleString()} credits available</span>
            </div>
          )}
        </div>

        {/* Credits Calculator */}
        <CreditsCalculator />

        {/* Pricing Tiers */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {pricingTiers.map((tier, i) => (
            <div
              key={tier.name}
              className={`glass rounded-2xl p-6 relative animate-in ${tier.popular ? 'ring-2 ring-primary' : ''
                }`}
              style={{ animationDelay: `${i * 100}ms` }}
            >
              {tier.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2" variant="default">
                  Most Popular
                </Badge>
              )}

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <TierIcon name={tier.name} />
                </div>
                <h3 className="text-xl font-semibold">{tier.name}</h3>
              </div>

              <div className="mb-4">
                {tier.price > 0 ? (
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold">${tier.price}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                ) : (
                  <span className="text-2xl font-bold">Contact us</span>
                )}
              </div>

              <p className="text-sm text-muted-foreground mb-6">{tier.description}</p>

              <ul className="space-y-3 mb-6">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                variant={tier.popular ? 'hero' : 'outline'}
                className="w-full"
              >
                {tier.price > 0 ? 'Get Started' : 'Contact Sales'}
              </Button>
            </div>
          ))}
        </div>

        {/* Credit Breakdown */}
        <div className="max-w-2xl mx-auto animate-in" style={{ animationDelay: '400ms' }}>
          <h2 className="text-2xl font-bold mb-6 text-center">Credit Usage</h2>
          <div className="glass rounded-2xl overflow-hidden">
            <div className="divide-y divide-border">
              {creditBreakdown.map((item) => (
                <div key={item.action} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{item.action}</p>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                  <div className="flex items-center gap-1 text-primary font-semibold">
                    <Zap className="w-4 h-4" />
                    {item.cost}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
