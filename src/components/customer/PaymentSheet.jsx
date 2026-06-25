import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const UPI_APPS = [
  { name: 'Google Pay', id: 'gpay', color: '#4285F4' },
  { name: 'PhonePe', id: 'phonepe', color: '#5F259F' },
  { name: 'Paytm', id: 'paytm', color: '#00BAF2' },
  { name: 'Other UPI', id: 'upi', color: '#6B7280' },
];

export default function PaymentSheet({ open, onClose, total, restaurant }) {
  const [tip, setTip] = useState('');
  const [rating, setRating] = useState(0);

  const finalAmount = total + (parseFloat(tip) || 0);

  const payViaUPI = (app) => {
    const upiId = restaurant?.upi_id;
    const payeeName = restaurant?.upi_payee_name || restaurant?.name || 'Restaurant';
    if (!upiId) return;

    const params = new URLSearchParams({
      pa: upiId,
      pn: payeeName,
      am: finalAmount.toFixed(2),
      cu: 'INR',
      tn: `Payment for order${tip ? ' + tip' : ''}`,
    });

    window.location.href = `upi://pay?${params.toString()}`;
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-[71] bg-background rounded-t-3xl"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <div className="p-6 space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg font-semibold">Pay via UPI</h3>
                <motion.button whileTap={{ scale: 0.9 }} onClick={onClose}>
                  <X className="w-5 h-5 text-muted-foreground" />
                </motion.button>
              </div>

              <div className="glass rounded-xl p-4 text-center">
                <p className="text-sm text-muted-foreground">Total Bill</p>
                <p className="font-display text-3xl font-bold text-primary mt-1">
                  ₹{total.toLocaleString()}
                </p>
              </div>

              {/* Tip */}
              <div>
                <label className="text-sm font-medium mb-2 block">Add a tip (optional)</label>
                <div className="flex gap-2">
                  {[20, 50, 100].map(t => (
                    <Button
                      key={t}
                      variant={tip === String(t) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTip(String(t))}
                    >
                      ₹{t}
                    </Button>
                  ))}
                  <Input
                    type="number"
                    placeholder="Custom"
                    value={tip}
                    onChange={e => setTip(e.target.value)}
                    className="w-24 bg-secondary"
                  />
                </div>
              </div>

              {/* Rating */}
              <div>
                <label className="text-sm font-medium mb-2 block">Rate your experience (optional)</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(s => (
                    <button key={s} onClick={() => setRating(s)}>
                      <Star className={`w-7 h-7 transition-colors ${s <= rating ? 'text-primary fill-primary' : 'text-muted-foreground'}`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Final amount */}
              {parseFloat(tip) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total with tip</span>
                  <span className="font-bold text-primary">₹{finalAmount.toLocaleString()}</span>
                </div>
              )}

              {/* UPI Apps */}
              <div className="grid grid-cols-2 gap-2">
                {UPI_APPS.map(app => (
                  <Button
                    key={app.id}
                    variant="outline"
                    className="h-12 text-sm gap-2"
                    onClick={() => payViaUPI(app)}
                  >
                    <div className="w-3 h-3 rounded-full" style={{ background: app.color }} />
                    {app.name}
                  </Button>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}