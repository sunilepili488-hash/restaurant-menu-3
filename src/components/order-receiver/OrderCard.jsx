import React, { useState } from 'react';
import { ShoppingBag, Bell, Clock, Check, X, Utensils } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const statusConfig = {
  pending: { label: 'Pending', color: 'text-amber-500', border: 'border-amber-500/40', bg: 'bg-amber-500/5' },
  confirmed: { label: 'Confirmed', color: 'text-blue-500', border: 'border-blue-500/40', bg: 'bg-blue-500/5' },
  ready: { label: 'Ready', color: 'text-green-500', border: 'border-green-500/40', bg: 'bg-green-500/5' },
  completed: { label: 'Completed', color: 'text-muted-foreground', border: 'border-border', bg: 'bg-muted/5' },
  cancelled: { label: 'Cancelled', color: 'text-destructive', border: 'border-destructive/40', bg: 'bg-destructive/5' },
};

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ${mins % 60}m ago`;
}

export default function OrderCard({ order, onUpdate }) {
  const [cancelMode, setCancelMode] = useState(false);
  const [reason, setReason] = useState('');
  const cfg = statusConfig[order.status] || statusConfig.pending;
  const isWaiterCall = order.type === 'waiter_call';

  const handleCancel = () => {
    if (cancelMode) {
      onUpdate(order.id, 'cancelled', reason);
      setCancelMode(false);
      setReason('');
    } else {
      setCancelMode(true);
    }
  };

  return (
    <div className={`rounded-xl border-2 ${cfg.border} ${cfg.bg} p-4`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isWaiterCall ? 'bg-accent/20' : 'bg-primary/20'}`}>
            {isWaiterCall ? <Bell className="w-4 h-4 text-accent-foreground" /> : <ShoppingBag className="w-4 h-4 text-primary" />}
          </div>
          <div>
            <p className="text-sm font-semibold">
              {isWaiterCall ? order.waiter_call_label : 'Order'}
              {order.table_number && ` · Table ${order.table_number}`}
            </p>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" /> {timeAgo(order.created_date)}
            </p>
          </div>
        </div>
        <span className={`text-xs font-medium ${cfg.color}`}>{cfg.label}</span>
      </div>

      {isWaiterCall ? (
        <p className="text-sm text-muted-foreground mb-3">{order.waiter_call_label} request from Table {order.table_number || 'N/A'}</p>
      ) : (
        <div className="space-y-1 mb-3">
          {order.items?.map((item, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span>{item.qty}× {item.name}</span>
              <span className="text-muted-foreground">₹{(item.price * item.qty).toLocaleString()}</span>
            </div>
          ))}
          {order.total > 0 && (
            <div className="flex justify-between text-sm font-semibold pt-1 border-t border-border">
              <span>Total</span>
              <span>₹{order.total.toLocaleString()}</span>
            </div>
          )}
        </div>
      )}

      {cancelMode && (
        <div className="mb-2 flex gap-2">
          <Input value={reason} onChange={e => setReason(e.target.value)} placeholder="Cancel reason (optional)" className="bg-secondary text-sm h-8" />
          <Button size="sm" variant="destructive" onClick={handleCancel}>Confirm</Button>
          <Button size="sm" variant="outline" onClick={() => setCancelMode(false)}>Back</Button>
        </div>
      )}

      {!cancelMode && order.status !== 'completed' && order.status !== 'cancelled' && (
        <div className="flex flex-wrap gap-2">
          {isWaiterCall ? (
            <Button size="sm" className="gap-1 bg-green-600 text-white" onClick={() => onUpdate(order.id, 'completed')}>
              <Check className="w-3.5 h-3.5" /> Resolve
            </Button>
          ) : (
            <>
              {order.status === 'pending' && (
                <Button size="sm" className="gap-1 bg-blue-600 text-white" onClick={() => onUpdate(order.id, 'confirmed')}>
                  <Check className="w-3.5 h-3.5" /> Confirm
                </Button>
              )}
              {order.status === 'confirmed' && (
                <Button size="sm" className="gap-1 bg-green-600 text-white" onClick={() => onUpdate(order.id, 'ready')}>
                  <Utensils className="w-3.5 h-3.5" /> Ready
                </Button>
              )}
              {order.status === 'ready' && (
                <Button size="sm" className="gap-1 bg-primary text-primary-foreground" onClick={() => onUpdate(order.id, 'completed')}>
                  <Check className="w-3.5 h-3.5" /> Complete
                </Button>
              )}
              <Button size="sm" variant="outline" className="gap-1 text-destructive" onClick={handleCancel}>
                <X className="w-3.5 h-3.5" /> Cancel
              </Button>
            </>
          )}
        </div>
      )}

      {order.status === 'cancelled' && order.cancel_reason && (
        <p className="text-xs text-destructive mt-2">Reason: {order.cancel_reason}</p>
      )}
    </div>
  );
}