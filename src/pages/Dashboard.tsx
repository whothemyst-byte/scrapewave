import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useApp } from '@/contexts/AppContext';
import { Zap, Plus, FileText, Clock, ArrowRight, Map } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function Dashboard() {
  const { credits, results, recentActivity } = useApp();

  const quickStats = [
    { label: 'Available Credits', value: credits.toLocaleString(), icon: Zap },
    { label: 'Results Collected', value: results.length.toString(), icon: FileText },
  ];

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 animate-in">
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's your scraping overview.</p>
        </div>

        {/* Quick Stats */}
        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          {quickStats.map((stat, i) => (
            <div
              key={stat.label}
              className="glass rounded-xl p-6 animate-in"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <stat.icon className="w-6 h-6 text-primary" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8 animate-in" style={{ animationDelay: '200ms' }}>
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
          </div>
        </div>

        {/* Recent Activity */}
        <div className="animate-in" style={{ animationDelay: '300ms' }}>
          <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
          <div className="glass rounded-xl divide-y divide-border">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity) => (
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
