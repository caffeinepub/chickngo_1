import { useRef } from 'react';
import { Printer, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { LocalCustomer } from '../hooks/useQueries';

interface QRCardPreviewProps {
  customer: LocalCustomer;
}

function getQRUrl(customerId: string, size = 200): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(customerId)}&bgcolor=ffffff&color=1f2933&margin=2`;
}

export function QRCardPreview({ customer }: QRCardPreviewProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const printContent = cardRef.current?.innerHTML;
    if (!printContent) return;
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`
      <html>
        <head>
          <title>QR Card - ${customer.name}</title>
          <style>
            body { margin: 0; padding: 20px; font-family: Inter, sans-serif; display: flex; justify-content: center; }
            .qr-card { width: 320px; border: 2px solid #ff6b00; border-radius: 16px; overflow: hidden; }
            .qr-header { background: #1f2933; padding: 16px; text-align: center; }
            .qr-header h2 { color: #ff6b00; margin: 0; font-size: 20px; font-weight: 800; }
            .qr-header p { color: #aaa; margin: 4px 0 0; font-size: 12px; }
            .qr-body { padding: 20px; text-align: center; background: white; }
            .qr-body img { width: 180px; height: 180px; }
            .customer-name { font-size: 18px; font-weight: 700; color: #1f2933; margin: 12px 0 4px; }
            .customer-id { font-size: 11px; color: #888; font-family: monospace; }
            .qr-footer { background: #ff6b00; padding: 10px; text-align: center; color: white; font-size: 12px; font-weight: 600; }
          </style>
        </head>
        <body>
          <div class="qr-card">
            <div class="qr-header">
              <h2>🐔 ChickNGo</h2>
              <p>Loyalty Card</p>
            </div>
            <div class="qr-body">
              <img src="${getQRUrl(customer.customerId, 180)}" alt="QR Code" />
              <div class="customer-name">${customer.name}</div>
              <div class="customer-id">${customer.customerId}</div>
            </div>
            <div class="qr-footer">Scan to earn loyalty points!</div>
          </div>
        </body>
      </html>
    `);
    win.document.close();
    win.print();
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = getQRUrl(customer.customerId, 300);
    link.download = `${customer.customerId}-qr.png`;
    link.target = '_blank';
    link.click();
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* QR Card */}
      <div
        ref={cardRef}
        className="w-72 rounded-2xl overflow-hidden shadow-card-hover border-2"
        style={{ borderColor: 'oklch(0.65 0.19 45)' }}
      >
        {/* Card Header */}
        <div
          className="px-5 py-4 text-center"
          style={{ backgroundColor: 'oklch(0.22 0.015 240)' }}
        >
          <div className="text-xl font-display font-bold" style={{ color: 'oklch(0.65 0.19 45)' }}>
            🐔 ChickNGo
          </div>
          <div className="text-xs mt-0.5" style={{ color: 'oklch(0.60 0.01 240)' }}>
            Loyalty Card
          </div>
        </div>

        {/* QR Code */}
        <div className="bg-white px-6 py-5 flex flex-col items-center">
          <img
            src={getQRUrl(customer.customerId)}
            alt={`QR Code for ${customer.name}`}
            className="w-44 h-44 rounded-lg"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://chart.googleapis.com/chart?chs=200x200&cht=qr&chl=${encodeURIComponent(customer.customerId)}`;
            }}
          />
          <div className="mt-3 text-center">
            <div className="font-semibold text-lg" style={{ color: 'oklch(0.22 0.015 240)' }}>
              {customer.name}
            </div>
            <div className="text-xs font-mono mt-1" style={{ color: 'oklch(0.52 0.01 240)' }}>
              {customer.customerId}
            </div>
            <div className="text-xs mt-1" style={{ color: 'oklch(0.52 0.01 240)' }}>
              📱 {customer.mobile}
            </div>
          </div>
        </div>

        {/* Card Footer */}
        <div
          className="px-5 py-3 text-center text-white text-xs font-semibold"
          style={{ backgroundColor: 'oklch(0.65 0.19 45)' }}
        >
          Scan to earn loyalty points! 🎁
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 no-print">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrint}
          className="gap-2"
        >
          <Printer size={15} />
          Print Card
        </Button>
        <Button
          size="sm"
          onClick={handleDownload}
          className="gap-2"
          style={{ backgroundColor: 'oklch(0.65 0.19 45)', color: 'white' }}
        >
          <Download size={15} />
          Download QR
        </Button>
      </div>
    </div>
  );
}

export { getQRUrl };
