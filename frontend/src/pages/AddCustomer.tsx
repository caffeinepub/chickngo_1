import { useState } from 'react';
import { UserPlus, CheckCircle2, AlertCircle, User, Phone } from 'lucide-react';
import { DashboardLayout } from '../components/DashboardLayout';
import { QRCardPreview } from '../components/QRCardPreview';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAddLocalCustomer } from '../hooks/useQueries';
import type { LocalCustomer } from '../hooks/useQueries';

export function AddCustomer() {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [error, setError] = useState('');
  const [newCustomer, setNewCustomer] = useState<LocalCustomer | null>(null);

  const addCustomer = useAddLocalCustomer();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setNewCustomer(null);

    // Client-side validation
    if (!name.trim()) {
      setError('Customer name is required.');
      return;
    }
    if (!mobile.trim()) {
      setError('Mobile number is required.');
      return;
    }
    if (!/^\+?[\d\s\-()]{7,15}$/.test(mobile.trim())) {
      setError('Please enter a valid mobile number.');
      return;
    }

    try {
      const customer = await addCustomer.mutateAsync({ name, mobile });
      setNewCustomer(customer);
      setName('');
      setMobile('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add customer.');
    }
  };

  const handleAddAnother = () => {
    setNewCustomer(null);
    setError('');
  };

  return (
    <DashboardLayout title="Add Customer">
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        {newCustomer ? (
          /* Success State */
          <div className="space-y-6">
            <Alert className="border-success/50 bg-success/10">
              <CheckCircle2 className="h-4 w-4 text-success" />
              <AlertDescription className="text-success font-medium">
                Customer <strong>{newCustomer.name}</strong> registered successfully! ID:{' '}
                <span className="font-mono">{newCustomer.customerId}</span>
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Customer Details */}
              <Card className="shadow-card border-border">
                <CardHeader>
                  <CardTitle className="text-base">Customer Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white text-xl font-bold shrink-0"
                      style={{ backgroundColor: 'oklch(0.65 0.19 45)' }}
                    >
                      {newCustomer.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{newCustomer.name}</p>
                      <p className="text-sm text-muted-foreground">{newCustomer.mobile}</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground">Customer ID</span>
                      <span className="font-mono font-medium text-xs">{newCustomer.customerId}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground">Points</span>
                      <span className="font-semibold" style={{ color: 'oklch(0.65 0.19 45)' }}>
                        {newCustomer.points}
                      </span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-muted-foreground">Registered</span>
                      <span className="font-medium">
                        {new Date(newCustomer.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <Button
                    onClick={handleAddAnother}
                    className="w-full"
                    style={{ backgroundColor: 'oklch(0.65 0.19 45)', color: 'white' }}
                  >
                    <UserPlus size={16} className="mr-2" />
                    Add Another Customer
                  </Button>
                </CardContent>
              </Card>

              {/* QR Card Preview */}
              <Card className="shadow-card border-border">
                <CardHeader>
                  <CardTitle className="text-base">QR Loyalty Card</CardTitle>
                  <CardDescription>Print or download this card for the customer</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center">
                  <QRCardPreview customer={newCustomer} />
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          /* Form State */
          <Card className="shadow-card border-border max-w-lg mx-auto">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: 'oklch(0.65 0.19 45 / 0.15)' }}
                >
                  <UserPlus size={20} style={{ color: 'oklch(0.65 0.19 45)' }} />
                </div>
                <div>
                  <CardTitle>Register New Customer</CardTitle>
                  <CardDescription>
                    A unique QR loyalty card will be generated automatically
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-5">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <div className="relative">
                    <User
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    />
                    <Input
                      id="name"
                      type="text"
                      placeholder="e.g. John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-9"
                      disabled={addCustomer.isPending}
                      maxLength={100}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mobile">Mobile Number *</Label>
                  <div className="relative">
                    <Phone
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    />
                    <Input
                      id="mobile"
                      type="tel"
                      placeholder="e.g. +1 234 567 8900"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      className="pl-9"
                      disabled={addCustomer.isPending}
                      maxLength={15}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Mobile number must be unique per customer
                  </p>
                </div>

                <div
                  className="rounded-lg p-4 text-sm"
                  style={{ backgroundColor: 'oklch(0.65 0.19 45 / 0.08)' }}
                >
                  <p className="font-medium mb-1" style={{ color: 'oklch(0.65 0.19 45)' }}>
                    What happens next?
                  </p>
                  <ul className="space-y-1 text-muted-foreground text-xs">
                    <li>✅ Unique customer ID generated automatically</li>
                    <li>✅ QR loyalty card created instantly</li>
                    <li>✅ Customer starts with 0 points</li>
                    <li>✅ Print or download the QR card</li>
                  </ul>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 font-semibold shadow-orange"
                  disabled={addCustomer.isPending}
                  style={{ backgroundColor: 'oklch(0.65 0.19 45)', color: 'white' }}
                >
                  {addCustomer.isPending ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Registering...
                    </span>
                  ) : (
                    <>
                      <UserPlus size={16} className="mr-2" />
                      Register Customer
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
