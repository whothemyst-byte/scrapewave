export interface ScraperResult {
  company_name: string;
  verified: boolean;
  phone: string | null;
  email: string | null;
  website: string | null;
  rating: number | null;
  rating_count: number | null;
}

export interface ScraperRequest {
  category: string;
  location: string;
  max_results?: number;
  verified_only?: boolean;
}

export interface CreditUsage {
  base_cost: number;
  per_result_cost: number;
  verification_cost: number;
}

export interface PricingTier {
  name: string;
  price: number;
  credits: number;
  description: string;
  features: string[];
  popular?: boolean;
}

export interface RecentActivity {
  id: string;
  type: 'scrape' | 'export' | 'verification';
  description: string;
  timestamp: Date;
  credits_used: number;
}
