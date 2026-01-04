import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/layout/Navbar';
import { Map, Search, Newspaper, Globe, ArrowRight, Zap, Shield, Clock } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4">
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] opacity-30 pointer-events-none"
          style={{ background: 'var(--gradient-glow)' }}
        />

        <div className="container mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary border border-border mb-8 animate-in">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">Verify business data instantly</span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 animate-in" style={{ animationDelay: '100ms' }}>
            Scrape. Verify.{' '}
            <span className="gradient-text">Scale.</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-in" style={{ animationDelay: '200ms' }}>
            Extract verified business data from Google Maps, search results, and the web. 
            Built for developers who need reliable data.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in" style={{ animationDelay: '300ms' }}>
            <Link to="/auth">
              <Button variant="hero" size="xl" className="group">
                Try Maps Scraper
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link to="/billing">
              <Button variant="hero-outline" size="xl">
                View Pricing
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Shield, title: 'Verified Data', desc: 'Every result is validated and verified' },
              { icon: Clock, title: 'Real-time Scraping', desc: 'Get fresh data in seconds, not hours' },
              { icon: Zap, title: 'Credit-based Pricing', desc: 'Pay only for what you use' },
            ].map((feature, i) => (
              <div
                key={feature.title}
                className="glass rounded-xl p-6 hover-lift animate-in"
                style={{ animationDelay: `${400 + i * 100}ms` }}
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modules Preview */}
      <section className="py-20 px-4 bg-secondary/30">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Modular Scraping Tools</h2>
            <p className="text-muted-foreground">Choose the right tool for your data needs</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Map, name: 'Maps Scraper', status: 'active', desc: 'Business listings from Google Maps' },
              { icon: Search, name: 'Search Scraper', status: 'soon', desc: 'Extract SERP results at scale' },
              { icon: Newspaper, name: 'News Scraper', status: 'soon', desc: 'Real-time news aggregation' },
              { icon: Globe, name: 'Webpage Scraper', status: 'soon', desc: 'Any URL, structured data' },
            ].map((module, i) => (
              <div
                key={module.name}
                className={`glass rounded-xl p-5 hover-lift animate-in ${
                  module.status === 'soon' ? 'opacity-60' : ''
                }`}
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <module.icon className="w-5 h-5 text-primary" />
                  </div>
                  {module.status === 'active' ? (
                    <span className="text-xs px-2 py-1 rounded-full bg-success/20 text-success">Active</span>
                  ) : (
                    <span className="text-xs px-2 py-1 rounded-full bg-primary/20 text-primary">Soon</span>
                  )}
                </div>
                <h3 className="font-semibold mb-1">{module.name}</h3>
                <p className="text-sm text-muted-foreground">{module.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to start scraping?</h2>
          <p className="text-muted-foreground mb-8">
            Get 500 free credits when you sign up. No credit card required.
          </p>
          <Link to="/auth">
            <Button variant="glow" size="xl">
              Start for Free
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
              <Zap className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold">Scrapewave</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link to="/billing" className="hover:text-foreground transition-colors">Pricing</Link>
            <Link to="/developer" className="hover:text-foreground transition-colors">API Docs</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
