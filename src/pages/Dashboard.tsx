import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useApp } from '@/contexts/AppContext';
import { WelcomeModal } from '@/components/onboarding/WelcomeModal';
import { Zap, Plus, FileText, Clock, ArrowRight, Map, TrendingUp, Target, BarChart3, Sparkles } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function Dashboard() {
  const { credits, results, recentActivity } = useApp();

  // Calculate insights
  const totalResults = results.length;
  const creditsUsedToday = recentActivity
    .filter(a => {
      const activityDate = new Date(a.timestamp);
      const today = new Date();
      return activityDate.toDateString() === today.toDateString();
    })
    .reduce((sum, a) => sum + a.credits_used, 0);

  const avgRating = results.length > 0
    ? (results.reduce((sum, r) => sum + (r.rating || 0), 0) / results.length).toFixed(1)
    : '0.0';

  const verifiedCount = results.filter(r => r.verified).length;
  const verifiedPercent = results.length > 0
    ? Math.round((verifiedCount / results.length) * 100)
    : 0;

  const quickStats = [
    {
      label: 'Available Credits',
      value: (credits ?? 0).toLocaleString(),
      icon: Zap,
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      label: 'Results Collected',
      value: totalResults.toString(),
      icon: FileText,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10'
    },
    {
      label: 'Credits Used Today',
      value: creditsUsedToday.toString(),
      icon: TrendingUp,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10'
    },
    {
      label: 'Verified Rate',
      value: `${verifiedPercent}%`,
      icon: Target,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10'
    },
  ];

  // Get tips based on user state
  const getTips = () => {
    if (totalResults === 0) {
      return { icon: Sparkles, message: 'Run your first scrape to start collecting business data!', action: 'New Scrape', href: '/modules/maps' };
    }
    if (credits && credits < 100) {
      return { icon: Zap, message: 'Running low on credits? Top up to continue scraping.', action: 'Add Credits', href: '/billing' };
    }
    if (totalResults > 0 && recentActivity.filter(a => a.type === 'export').length === 0) {
      return { icon: FileText, message: 'Export your results to CSV or JSON for your projects.', action: 'View Results', href: '/results' };
    }
    return { icon: BarChart3, message: `You've collected ${totalResults} results with ${verifiedPercent}% verified rate. Keep scraping!`, action: 'New Scrape', href: '/modules/maps' };
  };

  const tip = getTips();

  return (
    <DashboardLayout>
      {/* Onboarding Modal for New Users */}
      <WelcomeModal credits={credits ?? 500} />

      <div className="container mx-auto px-4 py-8">
        {/* Header with contextual greeting */}
        <div className="mb-8 animate-in">
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            {totalResults > 0
              ? `You've collected ${totalResults.toLocaleString()} results. Keep up the great work!`
              : 'Welcome back! Start scraping to build your lead database.'}
          </p>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {quickStats.map((stat, i) => (
            <div
              key={stat.label}
              className="glass rounded-xl p-6 animate-in hover-lift"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Insights & Tips */}
        <div className="glass rounded-xl p-5 mb-8 animate-in flex items-center justify-between" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <tip.icon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">Tip</p>
              <p className="text-muted-foreground text-sm">{tip.message}</p>
            </div>
          </div>
          <Link to={tip.href}>
            <Button variant="outline" size="sm">
              {tip.action}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="mb-8 animate-in" style={{ animationDelay: '250ms' }}>
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-3">
            <Link to="/modules/maps">
              <Button variant="hero" className="group">
                <Plus className="w-4 h-4" />
                New Scrape
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link to="/results">
              <Button variant="outline">
                <FileText className="w-4 h-4" />
                View Results
              </Button>
            </Link>
            <Link to="/billing">
              <Button variant="outline">
                <Zap className="w-4 h-4" />
                Add Credits
              </Button>
            </Link>
            <Link to="/developer">
              <Button variant="outline">
                <BarChart3 className="w-4 h-4" />
                API Access
              </Button>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="animate-in" style={{ animationDelay: '300ms' }}>
          <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
          <div className="glass rounded-xl divide-y divide-border">
            {recentActivity.length > 0 ? (
              recentActivity.slice(0, 5).map((activity) => (
                <div key={activity.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                      {activity.type === 'scrape' ? (
                        <Map className="w-5 h-5 text-primary" />
                      ) : activity.type === 'export' ? (
                        <FileText className="w-5 h-5 text-primary" />
                      ) : (
                        <Clock className="w-5 h-5 text-primary" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{activity.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Zap className="w-4 h-4 text-primary" />
                    -{activity.credits_used}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center">
                <p className="text-muted-foreground">No recent activity</p>
                <Link to="/modules/maps" className="text-primary text-sm hover:underline mt-2 inline-block">
                  Start your first scrape →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
