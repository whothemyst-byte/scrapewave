import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useApp } from '@/contexts/AppContext';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Download, FileJson, ExternalLink, Check, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const ITEMS_PER_PAGE = 10;

export default function Results() {
  const { results, addActivity, credits, setCredits } = useApp();
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const filteredResults = useMemo(() => {
    return verifiedOnly ? results.filter((r) => r.verified) : results;
  }, [results, verifiedOnly]);

  const totalPages = Math.ceil(filteredResults.length / ITEMS_PER_PAGE);
  const paginatedResults = filteredResults.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleExport = (format: 'csv' | 'json') => {
    if (filteredResults.length === 0) {
      toast({
        title: 'No results',
        description: 'There are no results to export.',
        variant: 'destructive',
      });
      return;
    }

    const exportCost = 5;
    if (credits < exportCost) {
      toast({
        title: 'Insufficient credits',
        description: 'Please add more credits to export.',
        variant: 'destructive',
      });
      return;
    }

    let content: string;
    let filename: string;
    let mimeType: string;

    if (format === 'csv') {
      const headers = ['Company Name', 'Verified', 'Phone', 'Email', 'Website', 'Rating', 'Rating Count'];
      const rows = filteredResults.map((r) => [
        r.company_name,
        r.verified ? 'Yes' : 'No',
        r.phone || '',
        r.email || '',
        r.website || '',
        r.rating?.toString() || '',
        r.rating_count?.toString() || '',
      ]);
      content = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      filename = 'scrapewave-results.csv';
      mimeType = 'text/csv';
    } else {
      content = JSON.stringify(filteredResults, null, 2);
      filename = 'scrapewave-results.json';
      mimeType = 'application/json';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);

    setCredits(credits - exportCost);
    addActivity({
      type: 'export',
      description: `Exported ${filteredResults.length} results to ${format.toUpperCase()}`,
      credits_used: exportCost,
    });

    toast({
      title: 'Export complete',
      description: `Downloaded ${filename}`,
    });
  };

  // Reset to page 1 when filter changes
  const handleFilterChange = (value: boolean) => {
    setVerifiedOnly(value);
    setCurrentPage(1);
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 animate-in">
          <div>
            <h1 className="text-3xl font-bold mb-2">Results</h1>
            <p className="text-muted-foreground">
              {filteredResults.length} {filteredResults.length === 1 ? 'result' : 'results'} found
            </p>
          </div>

          {results.length > 0 && (
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="outline" onClick={() => handleExport('csv')}>
                <Download className="w-4 h-4" />
                Export CSV
              </Button>
              <Button variant="outline" onClick={() => handleExport('json')}>
                <FileJson className="w-4 h-4" />
                Export JSON
              </Button>
            </div>
          )}
        </div>

        {results.length > 0 ? (
          <>
            {/* Filters */}
            <div className="glass rounded-xl p-4 mb-6 flex items-center justify-between animate-in" style={{ animationDelay: '100ms' }}>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">Verified only</span>
                <Switch checked={verifiedOnly} onCheckedChange={handleFilterChange} />
              </div>
            </div>

            {/* Table */}
            <div className="glass rounded-xl overflow-hidden animate-in" style={{ animationDelay: '200ms' }}>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="text-muted-foreground">Company Name</TableHead>
                      <TableHead className="text-muted-foreground">Verified</TableHead>
                      <TableHead className="text-muted-foreground">Phone</TableHead>
                      <TableHead className="text-muted-foreground">Email</TableHead>
                      <TableHead className="text-muted-foreground">Website</TableHead>
                      <TableHead className="text-muted-foreground">Rating</TableHead>
                      <TableHead className="text-muted-foreground text-right">Reviews</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedResults.map((result, index) => (
                      <TableRow key={index} className="border-border">
                        <TableCell className="font-medium">{result.company_name}</TableCell>
                        <TableCell>
                          {result.verified ? (
                            <Badge variant="success" className="gap-1">
                              <Check className="w-3 h-3" />
                              Yes
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="gap-1">
                              <X className="w-3 h-3" />
                              No
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground">{result.phone || '—'}</TableCell>
                        <TableCell className="text-muted-foreground">{result.email || '—'}</TableCell>
                        <TableCell>
                          {result.website ? (
                            <a
                              href={result.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline inline-flex items-center gap-1"
                            >
                              Visit
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {result.rating ? (
                            <span className="text-warning font-medium">★ {result.rating}</span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {result.rating_count?.toLocaleString() || '—'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between p-4 border-t border-border">
                  <p className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum: number;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setCurrentPage(pageNum)}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="glass rounded-2xl p-12 text-center animate-in">
            <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
              <Download className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No results yet</h2>
            <p className="text-muted-foreground mb-6">Run a scrape to see results here</p>
            <Link to="/modules/maps">
              <Button variant="hero">Start Scraping</Button>
            </Link>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
