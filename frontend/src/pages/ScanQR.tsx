import { useState, useEffect } from 'react';
import { QrCode, CheckCircle2, Phone, Star, Plus, RefreshCw, AlertCircle } from 'lucide-react';
import { DashboardLayout } from '../components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useQRScanner } from '@/qr-code/useQRScanner';
import { useAddPointsToCustomer, getLocalCustomers } from '../hooks/useQueries';
import type { LocalCustomer } from '../hooks/useQueries';
import { toast } from 'sonner';

export function ScanQR() {
  const [scannedCustomer, setScannedCustomer] = useState<LocalCustomer | null>(null);
  const [scanError, setScanError] = useState('');
  const [pointsAdded, setPointsAdded] = useState(false);
  const [lastScannedId, setLastScannedId] = useState('');

  const addPoints = useAddPointsToCustomer();

  const {
    qrResults,
    isScanning,
    isActive,
    isSupported,
    error: cameraError,
    isLoading,
    canStartScanning,
    startScanning,
    stopScanning,
    clearResults,
    videoRef,
    canvasRef,
  } = useQRScanner({
    facingMode: 'environment',
    scanInterval: 300,
    maxResults: 1,
  });

  // Process QR scan results
  useEffect(() => {
    if (qrResults.length === 0) return;
    const latest = qrResults[0];
    const customerId = latest.data.trim();

    if (customerId === lastScannedId) return;
    setLastScannedId(customerId);
    setScanError('');
    setPointsAdded(false);

    const customers = getLocalCustomers();
    const found = customers.find((c) => c.customerId === customerId);

    if (found) {
      setScannedCustomer(found);
      stopScanning();
    } else {
      setScanError(`No customer found for ID: "${customerId}". Please check the QR code.`);
      setScannedCustomer(null);
    }
  }, [qrResults, lastScannedId, stopScanning]);

  const handleAddPoints = async () => {
    if (!scannedCustomer) return;
    try {
      const updated = await addPoints.mutateAsync({
        customerId: scannedCustomer.customerId,
        points: 10,
      });
      setScannedCustomer(updated);
      setPointsAdded(true);
      toast.success(`+10 points added to ${scannedCustomer.name}!`, {
        description: `Total points: ${updated.points}`,
        duration: 4000,
      });
    } catch {
      toast.error('Failed to add points. Please try again.');
    }
  };

  const handleScanAnother = () => {
    setScannedCustomer(null);
    setScanError('');
    setPointsAdded(false);
    setLastScannedId('');
    clearResults();
    startScanning();
  };

  return (
    <DashboardLayout title="Scan QR Code">
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
        {/* Scanner Card */}
        <Card className="shadow-card border-border overflow-hidden">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: 'oklch(0.65 0.19 45 / 0.15)' }}
              >
                <QrCode size={20} style={{ color: 'oklch(0.65 0.19 45)' }} />
              </div>
              <div>
                <CardTitle>QR Code Scanner</CardTitle>
                <CardDescription>Point camera at customer's QR loyalty card</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {isSupported === false ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Camera is not supported in this browser. Please use a modern browser with camera access.
                </AlertDescription>
              </Alert>
            ) : (
              <>
                {/* Camera Preview */}
                <div
                  className="relative rounded-xl overflow-hidden bg-black"
                  style={{ minHeight: '280px' }}
                >
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    style={{ minHeight: '280px', display: isActive ? 'block' : 'none' }}
                    playsInline
                    muted
                  />
                  <canvas ref={canvasRef} className="hidden" />

                  {!isActive && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                      <QrCode size={48} className="opacity-30 text-white" />
                      <p className="text-white/60 text-sm">Camera inactive</p>
                    </div>
                  )}

                  {isActive && isScanning && (
                    <div className="absolute inset-0 pointer-events-none">
                      {/* Scanning overlay */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div
                          className="w-52 h-52 border-2 rounded-xl relative"
                          style={{ borderColor: 'oklch(0.65 0.19 45)' }}
                        >
                          <div
                            className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 rounded-tl-lg"
                            style={{ borderColor: 'oklch(0.65 0.19 45)' }}
                          />
                          <div
                            className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 rounded-tr-lg"
                            style={{ borderColor: 'oklch(0.65 0.19 45)' }}
                          />
                          <div
                            className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 rounded-bl-lg"
                            style={{ borderColor: 'oklch(0.65 0.19 45)' }}
                          />
                          <div
                            className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 rounded-br-lg"
                            style={{ borderColor: 'oklch(0.65 0.19 45)' }}
                          />
                        </div>
                      </div>
                      <div
                        className="absolute bottom-3 left-0 right-0 text-center text-xs font-medium"
                        style={{ color: 'oklch(0.65 0.19 45)' }}
                      >
                        Scanning for QR code...
                      </div>
                    </div>
                  )}
                </div>

                {/* Camera Error */}
                {cameraError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{cameraError.message}</AlertDescription>
                  </Alert>
                )}

                {/* Scan Error */}
                {scanError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{scanError}</AlertDescription>
                  </Alert>
                )}

                {/* Controls */}
                <div className="flex gap-3">
                  {!isActive ? (
                    <Button
                      onClick={startScanning}
                      disabled={!canStartScanning || isLoading}
                      className="flex-1 h-11 font-semibold shadow-orange"
                      style={{ backgroundColor: 'oklch(0.65 0.19 45)', color: 'white' }}
                    >
                      {isLoading ? (
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Starting camera...
                        </span>
                      ) : (
                        <>
                          <QrCode size={16} className="mr-2" />
                          Start Scanner
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button
                      onClick={stopScanning}
                      variant="outline"
                      className="flex-1 h-11"
                      disabled={isLoading}
                    >
                      Stop Scanner
                    </Button>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Customer Info Card */}
        {scannedCustomer && (
          <Card
            className={`shadow-card border-2 animate-scale-in ${pointsAdded ? 'success-pulse' : ''}`}
            style={{ borderColor: pointsAdded ? 'oklch(0.62 0.17 145)' : 'oklch(0.65 0.19 45)' }}
          >
            <CardContent className="p-6">
              {/* Success Banner */}
              {pointsAdded && (
                <div
                  className="flex items-center gap-2 p-3 rounded-lg mb-4 text-white"
                  style={{ backgroundColor: 'oklch(0.62 0.17 145)' }}
                >
                  <CheckCircle2 size={18} />
                  <span className="font-semibold text-sm">
                    +10 points added successfully!
                  </span>
                </div>
              )}

              {/* Customer Header */}
              <div className="flex items-center gap-4 mb-5">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center text-white text-2xl font-bold shrink-0"
                  style={{ backgroundColor: 'oklch(0.65 0.19 45)' }}
                >
                  {scannedCustomer.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-display font-bold text-xl text-foreground">
                    {scannedCustomer.name}
                  </h3>
                  <Badge variant="outline" className="text-xs mt-1">
                    {scannedCustomer.customerId}
                  </Badge>
                </div>
              </div>

              {/* Customer Details */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                  <Phone size={15} className="text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Mobile</p>
                    <p className="text-sm font-medium">{scannedCustomer.mobile}</p>
                  </div>
                </div>
                <div
                  className="flex items-center gap-2 p-3 rounded-lg"
                  style={{ backgroundColor: 'oklch(0.65 0.19 45 / 0.1)' }}
                >
                  <Star size={15} style={{ color: 'oklch(0.65 0.19 45)' }} className="shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Points</p>
                    <p
                      className={`text-sm font-bold ${pointsAdded ? 'points-bounce' : ''}`}
                      style={{ color: 'oklch(0.65 0.19 45)' }}
                    >
                      {scannedCustomer.points}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                {!pointsAdded ? (
                  <Button
                    onClick={handleAddPoints}
                    disabled={addPoints.isPending}
                    className="flex-1 h-11 font-semibold shadow-orange"
                    style={{ backgroundColor: 'oklch(0.65 0.19 45)', color: 'white' }}
                  >
                    {addPoints.isPending ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Adding...
                      </span>
                    ) : (
                      <>
                        <Plus size={16} className="mr-1" />
                        Add Points (+10)
                      </>
                    )}
                  </Button>
                ) : (
                  <div
                    className="flex-1 h-11 flex items-center justify-center rounded-lg font-semibold text-white"
                    style={{ backgroundColor: 'oklch(0.62 0.17 145)' }}
                  >
                    <CheckCircle2 size={16} className="mr-2" />
                    Points Added!
                  </div>
                )}
                <Button
                  variant="outline"
                  onClick={handleScanAnother}
                  className="h-11 gap-2"
                >
                  <RefreshCw size={15} />
                  Scan Next
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
