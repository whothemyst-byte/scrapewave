import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Map, Search, Newspaper, Globe, ArrowRight } from 'lucide-react';

const modules = [
  {
    id: 'maps',
    name: 'Maps Scraper',
    description: 'Extract verified business listings from Google Maps. Get company names, phone numbers, emails, ratings, and more.',
    icon: Map,
    status: 'active' as const,
    path: '/modules/maps',
  },
  {
    id: 'search',
    name: 'Search Scraper',
    description: 'Scrape SERP results at scale. Extract titles, URLs, snippets, and featured results from search engines.',
    icon: Search,
    status: 'coming' as const,
    path: null,
  },
  {
    id: 'news',
    name: 'News Scraper',
    description: 'Real-time news aggregation from multiple sources. Get headlines, articles, and trending topics.',
    icon: Newspaper,
    status: 'coming' as const,
    path: null,
  },
  {
    id: 'webpage',
    name: 'Webpage Scraper',
    description: 'Scrape any URL for structured data. Extract text, images, tables, and custom selectors.',
    icon: Globe,
    status: 'coming' as const,
    path: null,
  },
];

export default function Modules() {
  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 animate-in">
          <h1 className="text-3xl font-bold mb-2">Scraper Modules</h1>
          <p className="text-muted-foreground">Choose a scraping tool to extract data</p>
        </div>

        {/* Modules Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {modules.map((module, i) => (
            <div
              key={module.id}
              className={`glass rounded-2xl p-6 hover-lift animate-in ${
                module.status === 'coming' ? 'opacity-60' : ''
              }`}
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                  <module.icon className="w-7 h-7 text-primary" />
                </div>
                {module.status === 'active' ? (
                  <Badge variant="success">Active</Badge>
                ) : (
                  <Badge variant="coming">Coming Soon</Badge>
                )}
              </div>

              <h3 className="text-xl font-semibold mb-2">{module.name}</h3>
              <p className="text-muted-foreground text-sm mb-6">{module.description}</p>

              {module.status === 'active' && module.path ? (
                <Link to={module.path}>
                  <Button variant="hero" className="w-full group">
                    Launch Scraper
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              ) : (
                <Button variant="outline" className="w-full" disabled>
                  Coming Soon
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
