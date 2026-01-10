import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useApp } from '@/contexts/AppContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Download, FileJson, Map, Calendar, Zap, Eye, Loader2, FileSpreadsheet, History } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

interface ScrapeJob {
  id: string;
  category: string;
  location: string;
  results_count: number;
  credits_used: number;
  status: string;
  results: any[];
  created_at: string;
}

export default function Results() {
  const { user } = useApp();
  const { toast } = useToast();
  const [jobs, setJobs] = useState<ScrapeJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<ScrapeJob | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [tableNotReady, setTableNotReady] = useState(false);

  useEffect(() => {
    if (user) {
      fetchJobs();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      // Cast as any since scrape_jobs table may not be in TypeScript definitions yet
      const { data, error } = await (supabase as any)
        .from('scrape_jobs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        if (error.message?.includes('relation') && error.message?.includes('does not exist')) {
          setTableNotReady(true);
        } else {
          console.error('Error fetching jobs:', error);
        }
      } else {
        setTableNotReady(false);
        setJobs((data as ScrapeJob[]) || []);
      }
    } catch (err) {
      console.error('Error:', err);
    }
    setLoading(false);
  };

  const downloadCSV = (job: ScrapeJob) => {
    if (!job.results || job.results.length === 0) {
      toast({
        title: 'No data',
        description: 'This job has no results to download.',
        variant: 'destructive',
      });
      return;
    }

    const results = job.results;
    const headers = Object.keys(results[0]).join(',');
    const rows = results.map((r: any) =>
      Object.values(r).map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')
    ).join('\n');
    const csv = `${headers}\n${rows}`;

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${job.category}-${job.location}-${format(new Date(job.created_at), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: 'Downloaded',
      description: 'CSV file downloaded successfully.',
    });
  };

  const downloadJSON = (job: ScrapeJob) => {
    if (!job.results || job.results.length === 0) {
      toast({
        title: 'No data',
        description: 'This job has no results to download.',
        variant: 'destructive',
      });
      return;
    }

    const blob = new Blob([JSON.stringify(job.results, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${job.category}-${job.location}-${format(new Date(job.created_at), 'yyyy-MM-dd')}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: 'Downloaded',
      description: 'JSON file downloaded successfully.',
    });
  };

  const viewDetails = (job: ScrapeJob) => {
    setSelectedJob(job);
    setDetailsOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 animate-in">
          <div className="flex items-center gap-3 mb-2">
            <History className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">Scrape History</h1>
          </div>
          <p className="text-muted-foreground">
            View and download your previous scrape results
          </p>
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        ) : tableNotReady ? (
          <div className="glass rounded-2xl p-12 text-center animate-in">
            <Map className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h2 className="text-xl font-semibold mb-2">Setup Required</h2>
            <p className="text-muted-foreground mb-4">
              Please run the database migration to enable scrape history.
            </p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center animate-in">
            <Map className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h2 className="text-xl font-semibold mb-2">No scrapes yet</h2>
            <p className="text-muted-foreground mb-6">
              Start scraping to build your lead database
            </p>
            <Button variant="hero" onClick={() => window.location.href = '/modules/maps'}>
              Start Scraping
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job, i) => (
              <div
                key={job.id}
                className="glass rounded-xl p-6 hover-lift animate-in"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Map className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">
                        {job.category} in {job.location}
                      </h3>
                      <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Zap className="w-4 h-4 text-primary" />
                          {job.credits_used} credits
                        </span>
                        <Badge variant={job.status === 'completed' ? 'default' : 'secondary'}>
                          {job.results_count} results
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-16 md:ml-0">
                    <Button variant="outline" size="sm" onClick={() => viewDetails(job)}>
                      <Eye className="w-4 h-4" />
                      View
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => downloadCSV(job)}>
                      <FileSpreadsheet className="w-4 h-4" />
                      CSV
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => downloadJSON(job)}>
                      <FileJson className="w-4 h-4" />
                      JSON
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Job Details Dialog */}
        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle>
                {selectedJob?.category} in {selectedJob?.location}
              </DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-auto">
              {selectedJob?.results && selectedJob.results.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Company</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Website</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Verified</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedJob.results.slice(0, 50).map((result: any, idx: number) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{result.company_name || '-'}</TableCell>
                        <TableCell>{result.phone || '-'}</TableCell>
                        <TableCell>
                          {result.website ? (
                            <a href={result.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                              Visit
                            </a>
                          ) : '-'}
                        </TableCell>
                        <TableCell>{result.rating || '-'}</TableCell>
                        <TableCell>
                          {result.verified ? (
                            <Badge variant="default">Verified</Badge>
                          ) : (
                            <Badge variant="secondary">No</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-muted-foreground py-8">No results available</p>
              )}
              {selectedJob?.results && selectedJob.results.length > 50 && (
                <p className="text-center text-muted-foreground text-sm py-4">
                  Showing first 50 of {selectedJob.results.length} results. Download to see all.
                </p>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
