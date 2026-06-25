import React, { useState, useEffect, useRef } from 'react';
import { supabase as base44 } from '@/api/supabaseClient';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ShoppingBag, LogOut, Search, Volume2, VolumeX, Loader2 } from 'lucide-react';
import OrderCard from '@/components/order-receiver/OrderCard';
import OrderSummary from '@/components/order-receiver/OrderSummary';

export default function OrderReceiver() {
  const [authed, setAuthed] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [tableFilter, setTableFilter] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const prevOrderCount = useRef(0);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (sessionStorage.getItem('order_receiver_auth') === 'true') setAuthed(true);
  }, []);

  const { data: restaurants = [] } = useQuery({
    queryKey: ['restaurant'],
    queryFn: () => base44.entities.Restaurant.list(),
    enabled: !authed,
  });

  const handleLogin = (e) => {
    e.preventDefault();
    const r = restaurants[0];
    if (username === (r?.admin_username || 'admin') && password === (r?.admin_password || 'admin123')) {
      sessionStorage.setItem('order_receiver_auth', 'true');
      setAuthed(true);
      setLoginError('');
    } else {
      setLoginError('Invalid credentials');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('order_receiver_auth');
    setAuthed(false);
    setUsername('');
    setPassword('');
  };

  const { data: orders = [] } = useQuery({
    queryKey: ['orders'],
    queryFn: () => base44.entities.Order.list('-created_date', 200),
    refetchInterval: 3000,
    enabled: authed,
  });

  // Audio notification on new order
  useEffect(() => {
    if (!authed || !soundOn) return;
    if (orders.length > prevOrderCount.current && prevOrderCount.current > 0) {
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 880;
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      } catch {}
    }
    prevOrderCount.current = orders.length;
  }, [orders, authed, soundOn]);

  const updateOrderStatus = async (id, status, cancelReason) => {
    const data = { status };
    if (cancelReason) data.cancel_reason = cancelReason;
    await base44.entities.Order.update(id, data);
    queryClient.invalidateQueries({ queryKey: ['orders'] });
  };

  const filteredOrders = orders.filter(o => {
    const isHistory = o.status === 'completed' || o.status === 'cancelled';
    if (showHistory !== isHistory) return false;
    if (filter !== 'all' && o.status !== filter) return false;
    if (tableFilter && o.table_number !== tableFilter) return false;
    if (search) {
      const s = search.toLowerCase();
      const matches = o.type === 'order'
        ? o.items?.some(i => i.name?.toLowerCase().includes(s))
        : o.waiter_call_label?.toLowerCase().includes(s);
      if (!matches) return false;
    }
    return true;
  });

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-sm space-y-4">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-3">
              <ShoppingBag className="w-8 h-8 text-primary" />
            </div>
            <h1 className="font-display text-2xl font-semibold">Order Receiver</h1>
            <p className="text-sm text-muted-foreground mt-1">Staff login</p>
          </div>
          {restaurants.length === 0 ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <form onSubmit={handleLogin} className="space-y-3">
              <Input value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" className="bg-secondary" />
              <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className="bg-secondary" />
              {loginError && <p className="text-sm text-destructive">{loginError}</p>}
              <Button type="submit" className="w-full bg-primary text-primary-foreground">Login</Button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-30 bg-background border-b border-border px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-primary" />
            <h1 className="font-display text-lg font-semibold">Order Receiver</h1>
            <span className="ml-2 w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setSoundOn(!soundOn)} className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center" aria-label="Toggle sound">
              {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <Button variant="outline" size="sm" onClick={handleLogout} className="gap-1">
              <LogOut className="w-3.5 h-3.5" /> Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-4 space-y-4">
        <OrderSummary orders={orders} />

        <div className="flex flex-wrap gap-2">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search dishes..." className="pl-10 bg-secondary" />
          </div>
          <Input value={tableFilter} onChange={e => setTableFilter(e.target.value)} placeholder="Table #" className="w-28 bg-secondary" />
          <select value={filter} onChange={e => setFilter(e.target.value)} className="bg-secondary border border-border rounded-md px-3 text-sm h-9">
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="ready">Ready</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <Button variant={showHistory ? 'default' : 'outline'} size="sm" onClick={() => { setShowHistory(!showHistory); setFilter('all'); }}>
            {showHistory ? 'Active Orders' : 'History'}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredOrders.map(order => (
            <OrderCard key={order.id} order={order} onUpdate={updateOrderStatus} />
          ))}
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground">{showHistory ? 'No completed orders yet' : 'No active orders — waiting for orders...'}</p>
          </div>
        )}
      </div>
    </div>
  );
}