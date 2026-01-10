import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/layout/Navbar';
import { Map, Search, Newspaper, Globe, ArrowRight, Zap, Shield, Clock, CheckCircle2, Users, Database, Star } from 'lucide-react';
import { useState, useEffect } from 'react';

// Interactive Demo Component
function InteractiveDemo() {
  const [step, setStep] = useState(0);
  const [typedCategory, setTypedCategory] = useState('');
  const [typedLocation, setTypedLocation] = useState('');
  const [showResults, setShowResults] = useState(false);

  const category = 'Coffee Shops';
  const location = 'San Francisco, CA';

  const demoResults = [
    { name: 'Blue Bottle Coffee', rating: 4.7, reviews: 2847, phone: '+1 (415) 555-0123', verified: true },
    { name: 'Sightglass Coffee', rating: 4.5, reviews: 1923, phone: '+1 (415) 555-0456', verified: true },
    { name: 'Ritual Coffee Roasters', rating: 4.6, reviews: 3102, phone: '+1 (415) 555-0789', verified: true },
  ];

  useEffect(() => {
    const timer1 = setTimeout(() => {
      // Type category
      let i = 0;
      const categoryInterval = setInterval(() => {
        if (i <= category.length) {
          setTypedCategory(category.slice(0, i));
          i++;
        } else {
          clearInterval(categoryInterval);
          setStep(1);
        }
      }, 80);
    }, 1000);

    const timer2 = setTimeout(() => {
      // Type location
      let j = 0;
      const locationInterval = setInterval(() => {
        if (j <= location.length) {
          setTypedLocation(location.slice(0, j));
          j++;
        } else {
          clearInterval(locationInterval);
          setStep(2);
        }
      }, 60);
    }, 2500);

    const timer3 = setTimeout(() => {
      setShowResults(true);
    }, 4500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  return (
    <div className="glass rounded-2xl p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-3 h-3 rounded-full bg-red-500" />
        <div className="w-3 h-3 rounded-full bg-yellow-500" />
        <div className="w-3 h-3 rounded-full bg-green-500" />
        <span className="ml-2 text-xs text-muted-foreground">VeriLead Maps Scraper</span>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="text-xs text-muted-foreground mb-1 block">Category</label>
            <div className="h-10 px-3 rounded-lg bg-background border border-border flex items-center">
              <span className="font-mono text-sm">{typedCategory}</span>
              {step === 0 && <span className="w-0.5 h-5 bg-primary animate-pulse ml-0.5" />}
            </div>
          </div>
          <div className="flex-1">
            <label className="text-xs text-muted-foreground mb-1 block">Location</label>
            <div className="h-10 px-3 rounded-lg bg-background border border-border flex items-center">
              <span className="font-mono text-sm">{typedLocation}</span>
              {step === 1 && <span className="w-0.5 h-5 bg-primary animate-pulse ml-0.5" />}
            </div>
          </div>
        </div>
      </div>

      {showResults && (
        <div className="border-t border-border pt-4 animate-in">
          <p className="text-xs text-muted-foreground mb-3">Found {demoResults.length} verified results</p>
          <div className="space-y-2">
            {demoResults.map((result, i) => (
              <div
                key={result.name}
                className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border animate-in"
                style={{ animationDelay: `${i * 150}ms` }}
              >
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <div>
                    <p className="text-sm font-medium">{result.name}</p>
                    <p className="text-xs text-muted-foreground">{result.phone}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                    {result.rating}
                  </div>
                  <p className="text-xs text-muted-foreground">{result.reviews.toLocaleString()} reviews</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 px-4">
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] opacity-30 pointer-events-none"
          style={{ background: 'var(--gradient-glow)' }}
        />

        <div className="container mx-auto text-center relative z-10">
          {/* Trust Stats Bar */}
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10 mb-8 animate-in">
            {[
              { value: '2M+', label: 'Businesses Scraped' },
              { value: '99.2%', label: 'Data Accuracy' },
              { value: '5K+', label: 'Active Developers' },
            ].map((stat, i) => (
              <div key={stat.label} className="text-center" style={{ animationDelay: `${i * 100}ms` }}>
                <p className="text-2xl md:text-3xl font-bold gradient-text">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary border border-border mb-6 animate-in" style={{ animationDelay: '100ms' }}>
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">Get 500 free credits when you sign up</span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 animate-in" style={{ animationDelay: '150ms' }}>
            Turn Google Maps into{' '}
            <span className="gradient-text">Your Lead Database</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-6 animate-in" style={{ animationDelay: '200ms' }}>
            Extract verified business data with phone numbers, emails, and ratings in seconds.
            No coding required. Pay only for what you use.
          </p>

          {/* 3 Key Benefits */}
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 mb-10 animate-in" style={{ animationDelay: '250ms' }}>
            {[
              { icon: Shield, text: 'Verified & accurate data' },
              { icon: Clock, text: 'Results in under 30 seconds' },
              { icon: Database, text: 'Export to CSV or JSON' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2 text-sm text-muted-foreground">
                <Icon className="w-4 h-4 text-primary" />
                <span>{text}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in" style={{ animationDelay: '300ms' }}>
            <Link to="/auth">
              <Button variant="hero" size="xl" className="group">
                Start Scraping Free
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link to="/billing">
              <Button variant="hero-outline" size="xl">
                View Pricing
              </Button>
            </Link>
          </div>

          <p className="text-xs text-muted-foreground mt-4 animate-in" style={{ animationDelay: '350ms' }}>
            <Users className="w-3 h-3 inline mr-1" />
            Trusted by developers at startups and agencies worldwide
          </p>
        </div>
      </section>

      {/* Interactive Demo Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">See It In Action</h2>
            <p className="text-muted-foreground">Watch how easy it is to scrape business data</p>
          </div>
          <InteractiveDemo />
          <div className="text-center mt-6">
            <Link to="/auth">
              <Button variant="outline" className="group">
                Try It Yourself
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
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
              { icon: Shield, title: 'Verified Data', desc: 'Every result is validated for accuracy and freshness' },
              { icon: Clock, title: 'Real-time Scraping', desc: 'Get results in seconds, not hours of waiting' },
              { icon: Zap, title: 'Credit-based Pricing', desc: 'Pay only for successful results, no subscriptions needed' },
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
                className={`glass rounded-xl p-5 hover-lift animate-in ${module.status === 'soon' ? 'opacity-60' : ''
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

      {/* Testimonials / Social Proof */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Loved by Developers</h2>
            <p className="text-muted-foreground">See what our users are saying</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                quote: "VeriLead saved me hours of manual data collection. The verified results are incredibly accurate.",
                author: "Alex Chen",
                role: "Indie Hacker",
                avatar: "AC"
              },
              {
                quote: "The API is simple and the credit system is fair. We use it to power our lead generation tool.",
                author: "Sarah Miller",
                role: "Startup Founder",
                avatar: "SM"
              },
              {
                quote: "Finally a scraping tool that just works. The export to CSV feature is exactly what I needed.",
                author: "Marcus Johnson",
                role: "Data Analyst",
                avatar: "MJ"
              }
            ].map((testimonial, i) => (
              <div
                key={testimonial.author}
                className="glass rounded-xl p-6 animate-in"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="flex mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-6 italic">"{testimonial.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{testimonial.author}</p>
                    <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
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
            <span className="font-semibold">VeriLead</span>
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
