import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { useApp } from '@/contexts/AppContext';
import { useToast } from '@/hooks/use-toast';
import { useCredits } from '@/hooks/useCredits';
import { supabase } from '@/integrations/supabase/client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Download, FileJson, ExternalLink, Check, X, ChevronLeft, ChevronRight, Search, Globe, Phone, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const ITEMS_PER_PAGE = 10;

export default function Results() {
  const { results, addActivity } = useApp();
  const { credits, refetchCredits } = useCredits();
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [hasWebsite, setHasWebsite] = useState(false);
  const [hasPhone, setHasPhone] = useState(false);
  const [ratingRange, setRatingRange] = useState<[number, number]>([0, 5]);

  const filteredResults = useMemo(() => {
    return results.filter((r) => {
      // Verified filter
      if (verifiedOnly && !r.verified) return false;
      // Search filter
      if (searchQuery && !r.company_name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      // Has website filter
      if (hasWebsite && !r.website) return false;
      // Has phone filter
      if (hasPhone && !r.phone) return false;
      // Rating range filter
      if (r.rating != null) {
        if (r.rating < ratingRange[0] || r.rating > ratingRange[1]) return false;
      } else if (ratingRange[0] > 0) {
        // If min rating is set and result has no rating, exclude it
        return false;
      }
      return true;
    });
  }, [results, verifiedOnly, searchQuery, hasWebsite, hasPhone, ratingRange]);

  const totalPages = Math.ceil(filteredResults.length / ITEMS_PER_PAGE);
  const paginatedResults = filteredResults.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleExport = async (format: 'csv' | 'json') => {
    if (filteredResults.length === 0) {
      toast({
        title: 'No results',
        description: 'There are no results to export.',
        variant: 'destructive',
      });
      return;
    }

    // Client-side check for UX feedback before server call
    if (credits !== null && credits < 5) {
      toast({
        title: 'Insufficient credits',
        description: 'You need at least 5 credits to export. Please add more credits.',
        variant: 'destructive',
      });
      return;
    }

    setIsExporting(true);

    try {
      const { data, error } = await supabase.functions.invoke('export-data', {
        body: {
          results: filteredResults,
          format,
        },
      });

      if (error) {
        throw error;
      }

      if (!data || data.error) {
        // Handle insufficient credits from server
        if (data?.error === 'Insufficient credits') {
          toast({
            title: 'Insufficient credits',
            description: 'Please add more credits to export.',
            variant: 'destructive',
          });
          return;
        }
        throw new Error(data?.error || 'Export failed');
      }

      // Create and download the file
      const blob = new Blob([data.content], { type: data.mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = data.filename;
      a.click();
      URL.revokeObjectURL(url);

      // Refresh credits to show updated balance
      refetchCredits();

      // Log activity (for local tracking)
      addActivity({
        type: 'export',
        description: `Exported ${data.resultCount} results to ${format.toUpperCase()}`,
        credits_used: data.creditsUsed,
      });

      toast({
        title: 'Export complete',
        description: `Downloaded ${data.filename} (${data.creditsUsed} credits used)`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'Export failed',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Reset to page 1 when any filter changes
  const resetPage = () => setCurrentPage(1);

  const handleVerifiedChange = (value: boolean) => {
    setVerifiedOnly(value);
    resetPage();
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    resetPage();
  };

  const handleWebsiteChange = (value: boolean) => {
    setHasWebsite(value);
    resetPage();
  };

  const handlePhoneChange = (value: boolean) => {
    setHasPhone(value);
    resetPage();
  };

  const handleRatingChange = (value: number[]) => {
    setRatingRange([value[0], value[1]]);
    resetPage();
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
              <Button variant="outline" onClick={() => handleExport('csv')} disabled={isExporting}>
                {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                Export CSV
              </Button>
              <Button variant="outline" onClick={() => handleExport('json')} disabled={isExporting}>
                {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileJson className="w-4 h-4" />}
                Export JSON
              </Button>
            </div>
          )}
        </div>

        {results.length > 0 ? (
          <>
            {/* Filters */}
            <div className="glass rounded-xl p-4 mb-6 animate-in" style={{ animationDelay: '100ms' }}>
              <div className="flex flex-col gap-4">
                {/* Search and toggles row */}
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  {/* Search */}
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search company name..."
                      value={searchQuery}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      className="pl-9"
                    />
                  </div>

                  {/* Toggle filters */}
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Verified</span>
                      <Switch checked={verifiedOnly} onCheckedChange={handleVerifiedChange} />
                    </div>
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Has Website</span>
                      <Switch checked={hasWebsite} onCheckedChange={handleWebsiteChange} />
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Has Phone</span>
                      <Switch checked={hasPhone} onCheckedChange={handlePhoneChange} />
                    </div>
                  </div>
                </div>

                {/* Rating range slider */}
                <div className="flex flex-col md:flex-row md:items-center gap-3">
                  <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                    Rating: {ratingRange[0]} – {ratingRange[1]} ★
                  </span>
                  <div className="flex-1 max-w-xs">
                    <Slider
                      value={ratingRange}
                      onValueChange={handleRatingChange}
                      min={0}
                      max={5}
                      step={0.5}
                      className="w-full"
                    />
                  </div>
                </div>
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
