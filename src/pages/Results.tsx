import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Download, FileJson, ExternalLink, Check, X, ChevronLeft, ChevronRight, Search, Filter, Info, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

type RatingFilter = 'all' | '4plus' | '3plus' | 'below3';
type VerificationFilter = 'all' | 'verified' | 'unverified';

const ITEMS_PER_PAGE = 10;

export default function Results() {
  const { results, addActivity } = useApp();
  const { credits, refetchCredits } = useCredits();
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Active (applied) filters
  const [searchQuery, setSearchQuery] = useState('');
  const [ratingFilter, setRatingFilter] = useState<RatingFilter>('all');
  const [verificationFilter, setVerificationFilter] = useState<VerificationFilter>('all');
  
  // Pending (drawer) filters
  const [pendingRating, setPendingRating] = useState<RatingFilter>('all');
  const [pendingVerification, setPendingVerification] = useState<VerificationFilter>('all');

  const filteredResults = useMemo(() => {
    return results.filter((r) => {
      // Verification filter
      if (verificationFilter === 'verified' && !r.verified) return false;
      if (verificationFilter === 'unverified' && r.verified) return false;
      // Search filter
      if (searchQuery && !r.company_name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      // Rating filter
      if (ratingFilter !== 'all') {
        if (r.rating == null) return false;
        if (ratingFilter === '4plus' && r.rating < 4) return false;
        if (ratingFilter === '3plus' && r.rating < 3) return false;
        if (ratingFilter === 'below3' && r.rating >= 3) return false;
      }
      return true;
    });
  }, [results, verificationFilter, searchQuery, ratingFilter]);

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

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    resetPage();
  };

  const handleApplyFilters = () => {
    setRatingFilter(pendingRating);
    setVerificationFilter(pendingVerification);
    setIsFilterOpen(false);
    resetPage();
  };

  const handleClearFilters = () => {
    setPendingRating('all');
    setPendingVerification('all');
    setRatingFilter('all');
    setVerificationFilter('all');
    setIsFilterOpen(false);
    resetPage();
  };

  const handleOpenDrawer = (open: boolean) => {
    if (open) {
      // Sync pending with current when opening
      setPendingRating(ratingFilter);
      setPendingVerification(verificationFilter);
    }
    setIsFilterOpen(open);
  };

  const removeRatingFilter = () => {
    setRatingFilter('all');
    setPendingRating('all');
    resetPage();
  };

  const removeVerificationFilter = () => {
    setVerificationFilter('all');
    setPendingVerification('all');
    resetPage();
  };

  const hasActiveFilters = ratingFilter !== 'all' || verificationFilter !== 'all';

  const getRatingLabel = (filter: RatingFilter) => {
    switch (filter) {
      case '4plus': return '⭐ 4 & above';
      case '3plus': return '⭐ 3 & above';
      case 'below3': return '⭐ Below 3';
      default: return 'All ratings';
    }
  };

  const getVerificationLabel = (filter: VerificationFilter) => {
    switch (filter) {
      case 'verified': return 'Yes';
      case 'unverified': return 'No';
      default: return 'All';
    }
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
            {/* Search + Filters Button */}
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4 animate-in" style={{ animationDelay: '100ms' }}>
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search company name..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-9"
                />
              </div>

              <Sheet open={isFilterOpen} onOpenChange={handleOpenDrawer}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Filter className="w-4 h-4" />
                    Filters
                    {hasActiveFilters && (
                      <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 justify-center text-xs">
                        {(ratingFilter !== 'all' ? 1 : 0) + (verificationFilter !== 'all' ? 1 : 0)}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[320px] sm:w-[400px]">
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                  </SheetHeader>
                  <div className="flex flex-col gap-6 mt-6">
                    {/* Rating Filter */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Rating</label>
                      <Select value={pendingRating} onValueChange={(v) => setPendingRating(v as RatingFilter)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select rating" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All ratings</SelectItem>
                          <SelectItem value="4plus">⭐ 4 & above</SelectItem>
                          <SelectItem value="3plus">⭐ 3 & above</SelectItem>
                          <SelectItem value="below3">⭐ Below 3</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">Filter by minimum star rating</p>
                    </div>

                    {/* Verification Filter */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Verification Status</label>
                      <Select value={pendingVerification} onValueChange={(v) => setPendingVerification(v as VerificationFilter)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="verified">Verified only</SelectItem>
                          <SelectItem value="unverified">Unverified only</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">Verified = rating is 3 stars or above</p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 mt-4">
                      <Button onClick={handleApplyFilters} className="flex-1">
                        Apply Filters
                      </Button>
                      <Button variant="outline" onClick={handleClearFilters} className="flex-1">
                        Clear Filters
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Active Filter Chips */}
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-2 mb-4 animate-in" style={{ animationDelay: '150ms' }}>
                {ratingFilter !== 'all' && (
                  <Badge variant="secondary" className="gap-1 pr-1">
                    Rating: {getRatingLabel(ratingFilter)}
                    <button onClick={removeRatingFilter} className="ml-1 hover:bg-muted rounded p-0.5">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
                {verificationFilter !== 'all' && (
                  <Badge variant="secondary" className="gap-1 pr-1">
                    Verified: {getVerificationLabel(verificationFilter)}
                    <button onClick={removeVerificationFilter} className="ml-1 hover:bg-muted rounded p-0.5">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
                <button onClick={handleClearFilters} className="text-xs text-muted-foreground hover:text-foreground underline">
                  Clear all filters
                </button>
              </div>
            )}

            {/* Table */}
            <div className="glass rounded-xl overflow-hidden animate-in" style={{ animationDelay: '200ms' }}>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="text-muted-foreground">Company Name</TableHead>
                      <TableHead className="text-muted-foreground">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="inline-flex items-center gap-1 cursor-help">
                                Verified
                                <Info className="w-3.5 h-3.5" />
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Verified means the rating is 3 stars or above.</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableHead>
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
                            <Badge className="gap-1 bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/20 border-0">
                              <Check className="w-3 h-3" />
                              Yes
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="gap-1 bg-muted/50 text-muted-foreground border-0">
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
