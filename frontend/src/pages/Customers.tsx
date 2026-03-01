import { useState, useMemo } from 'react';
import { Search, Users, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { DashboardLayout } from '../components/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useLocalCustomers } from '../hooks/useQueries';
import { getQRUrl } from '../components/QRCardPreview';

const PAGE_SIZE = 10;

export function Customers() {
  const { data: customers, isLoading } = useLocalCustomers();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    if (!customers) return [];
    if (!search.trim()) return customers;
    const q = search.trim().toLowerCase();
    return customers.filter(
      (c) =>
        c.mobile.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q)
    );
  }, [customers, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSearch = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  return (
    <DashboardLayout title="Customers">
      <div className="space-y-5 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-display font-bold text-foreground">Customer List</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              {customers?.length ?? 0} total customers registered
            </p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              placeholder="Search by name or mobile..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Table Card */}
        <Card className="shadow-card border-border overflow-hidden">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            ) : paginated.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <Users size={48} className="mb-3 opacity-20" />
                <p className="font-medium">
                  {search ? 'No customers match your search' : 'No customers yet'}
                </p>
                <p className="text-sm mt-1">
                  {search ? 'Try a different search term' : 'Add your first customer to get started'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead className="font-semibold">Customer</TableHead>
                      <TableHead className="font-semibold">Mobile</TableHead>
                      <TableHead className="font-semibold">Points</TableHead>
                      <TableHead className="font-semibold">QR Code</TableHead>
                      <TableHead className="font-semibold">Joined</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginated.map((customer) => (
                      <TableRow key={customer.customerId} className="hover:bg-muted/30 transition-colors">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div
                              className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-semibold shrink-0"
                              style={{ backgroundColor: 'oklch(0.65 0.19 45)' }}
                            >
                              {customer.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-sm">{customer.name}</p>
                              <p className="text-xs text-muted-foreground font-mono">
                                {customer.customerId}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{customer.mobile}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <Star
                              size={13}
                              style={{ color: 'oklch(0.65 0.19 45)' }}
                              fill="oklch(0.65 0.19 45)"
                            />
                            <span
                              className="font-semibold text-sm"
                              style={{ color: 'oklch(0.65 0.19 45)' }}
                            >
                              {customer.points}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <img
                            src={getQRUrl(customer.customerId, 60)}
                            alt="QR"
                            className="w-12 h-12 rounded-md border border-border"
                            loading="lazy"
                          />
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(customer.createdAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>

          {/* Pagination */}
          {!isLoading && filtered.length > PAGE_SIZE && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Showing {(page - 1) * PAGE_SIZE + 1}–
                {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="gap-1"
                >
                  <ChevronLeft size={14} />
                  Prev
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <Button
                        key={pageNum}
                        variant={page === pageNum ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setPage(pageNum)}
                        className="w-8 h-8 p-0"
                        style={
                          page === pageNum
                            ? { backgroundColor: 'oklch(0.65 0.19 45)', color: 'white' }
                            : {}
                        }
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="gap-1"
                >
                  Next
                  <ChevronRight size={14} />
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
