import { useState } from 'react';
import { Gift, Plus, Trash2, Star, AlertCircle } from 'lucide-react';
import { DashboardLayout } from '../components/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useGetAllOffers, useAddOffer, useDeleteOffer } from '../hooks/useQueries';
import type { Offer } from '../backend';

interface OfferFormData {
  name: string;
  requiredPoints: string;
  rewardDescription: string;
}

const emptyForm: OfferFormData = {
  name: '',
  requiredPoints: '',
  rewardDescription: '',
};

export function Offers() {
  const { data: offers, isLoading } = useGetAllOffers();
  const addOffer = useAddOffer();
  const deleteOffer = useDeleteOffer();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [offerToDelete, setOfferToDelete] = useState<Offer | null>(null);
  const [form, setForm] = useState<OfferFormData>(emptyForm);
  const [formError, setFormError] = useState('');

  const handleOpenCreate = () => {
    setForm(emptyForm);
    setFormError('');
    setDialogOpen(true);
  };

  const handleFormChange = (field: keyof OfferFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFormError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!form.name.trim()) {
      setFormError('Offer name is required.');
      return;
    }
    const pts = parseInt(form.requiredPoints, 10);
    if (isNaN(pts) || pts < 1) {
      setFormError('Required points must be a positive number.');
      return;
    }
    if (!form.rewardDescription.trim()) {
      setFormError('Reward description is required.');
      return;
    }

    try {
      await addOffer.mutateAsync({
        name: form.name.trim(),
        requiredPoints: BigInt(pts),
        rewardDescription: form.rewardDescription.trim(),
      });
      setDialogOpen(false);
      setForm(emptyForm);
    } catch {
      setFormError('Failed to create offer. Please try again.');
    }
  };

  const handleDeleteClick = (offer: Offer) => {
    setOfferToDelete(offer);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!offerToDelete) return;
    try {
      await deleteOffer.mutateAsync(offerToDelete.id);
    } catch {
      // Error handled silently
    } finally {
      setDeleteDialogOpen(false);
      setOfferToDelete(null);
    }
  };

  return (
    <DashboardLayout title="Offers">
      <div className="space-y-5 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-display font-bold text-foreground">Loyalty Offers</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              {offers?.length ?? 0} active offers
            </p>
          </div>
          <Button
            onClick={handleOpenCreate}
            className="gap-2 shadow-orange"
            style={{ backgroundColor: 'oklch(0.65 0.19 45)', color: 'white' }}
          >
            <Plus size={16} />
            Create Offer
          </Button>
        </div>

        {/* Offers Table */}
        <Card className="shadow-card border-border overflow-hidden">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : !offers || offers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <Gift size={48} className="mb-3 opacity-20" />
                <p className="font-medium">No offers yet</p>
                <p className="text-sm mt-1">Create your first loyalty offer to get started</p>
                <Button
                  onClick={handleOpenCreate}
                  className="mt-4 gap-2"
                  style={{ backgroundColor: 'oklch(0.65 0.19 45)', color: 'white' }}
                >
                  <Plus size={15} />
                  Create First Offer
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead className="font-semibold">Offer Name</TableHead>
                      <TableHead className="font-semibold">Required Points</TableHead>
                      <TableHead className="font-semibold">Reward</TableHead>
                      <TableHead className="font-semibold text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {offers.map((offer) => (
                      <TableRow
                        key={offer.id.toString()}
                        className="hover:bg-muted/30 transition-colors"
                      >
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                              style={{ backgroundColor: 'oklch(0.65 0.19 45 / 0.15)' }}
                            >
                              <Gift size={14} style={{ color: 'oklch(0.65 0.19 45)' }} />
                            </div>
                            <span className="font-medium text-sm">{offer.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="gap-1 font-semibold"
                            style={{ borderColor: 'oklch(0.65 0.19 45)', color: 'oklch(0.65 0.19 45)' }}
                          >
                            <Star size={11} fill="currentColor" />
                            {offer.requiredPoints.toString()} pts
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-xs">
                          <p className="line-clamp-2">{offer.rewardDescription}</p>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteClick(offer)}
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 size={15} />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Offer Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Gift size={18} style={{ color: 'oklch(0.65 0.19 45)' }} />
              Create New Offer
            </DialogTitle>
          </DialogHeader>

          {formError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="offer-name">Offer Name *</Label>
              <Input
                id="offer-name"
                placeholder="e.g. Free Chicken Meal"
                value={form.name}
                onChange={(e) => handleFormChange('name', e.target.value)}
                disabled={addOffer.isPending}
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="required-points">Required Points *</Label>
              <div className="relative">
                <Star
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  id="required-points"
                  type="number"
                  placeholder="e.g. 100"
                  value={form.requiredPoints}
                  onChange={(e) => handleFormChange('requiredPoints', e.target.value)}
                  className="pl-9"
                  disabled={addOffer.isPending}
                  min={1}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reward-desc">Reward Description *</Label>
              <Textarea
                id="reward-desc"
                placeholder="Describe what the customer gets..."
                value={form.rewardDescription}
                onChange={(e) => handleFormChange('rewardDescription', e.target.value)}
                disabled={addOffer.isPending}
                rows={3}
                maxLength={500}
              />
            </div>

            <DialogFooter className="gap-2">
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={addOffer.isPending}>
                  Cancel
                </Button>
              </DialogClose>
              <Button
                type="submit"
                disabled={addOffer.isPending}
                style={{ backgroundColor: 'oklch(0.65 0.19 45)', color: 'white' }}
              >
                {addOffer.isPending ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating...
                  </span>
                ) : (
                  'Create Offer'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Offer</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{' '}
              <strong>"{offerToDelete?.name}"</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteOffer.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
