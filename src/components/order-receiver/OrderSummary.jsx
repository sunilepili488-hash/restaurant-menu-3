import React from 'react';
import { ShoppingBag, IndianRupee, Clock } from 'lucide-react';

function isToday(dateStr) {
  if (!dateStr) return false;
  return new Date(dateStr).toDateString() === new Date().toDateString();
}

export default function OrderSummary({ orders }) {
  const todayOrders = orders.filter(o => isToday(o.created_date) && o.type === 'order' && o.status !== 'cancelled');
  const totalRevenue = todayOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const pendingCount = orders.filter(o => o.status === 'pending').length;

  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="rounded-xl bg-card border border-border p-4">
        <div className="flex items-center gap-2 text-muted-foreground mb-1">
          <ShoppingBag className="w-4 h-4" />
          <span className="text-xs">Today's Orders</span>
        </div>
        <p className="text-2xl font-bold">{todayOrders.length}</p>
      </div>
      <div className="rounded-xl bg-card border border-border p-4">
        <div className="flex items-center gap-2 text-muted-foreground mb-1">
          <IndianRupee className="w-4 h-4" />
          <span className="text-xs">Total Revenue</span>
        </div>
        <p className="text-2xl font-bold">₹{totalRevenue.toLocaleString()}</p>
      </div>
      <div className="rounded-xl bg-card border border-border p-4">
        <div className="flex items-center gap-2 text-muted-foreground mb-1">
          <Clock className="w-4 h-4" />
          <span className="text-xs">Pending</span>
        </div>
        <p className="text-2xl font-bold text-amber-500">{pendingCount}</p>
      </div>
    </div>
  );
}