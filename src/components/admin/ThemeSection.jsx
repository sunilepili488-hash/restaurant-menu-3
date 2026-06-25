import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { supabase } from '@/api/supabaseClient';
import { useSafeSave } from '@/lib/saveUtils';
import { Save } from 'lucide-react';

export default function ThemeSection({ restaurant, onRefresh }) {
  const [primary, setPrimary] = useState('#C5A572');
  const [bg, setBg] = useState('#1A1A1A');
  const [currency, setCurrency] = useState('₹');
  const { saving, saved, error, save } = useSafeSave();
  const [themeMode, setThemeMode] = useState('dark');

  useEffect(() => {
    if (restaurant) {
      setPrimary(restaurant.theme_primary_color || '#C5A572');
      setBg(restaurant.theme_bg_color || '#1A1A1A');
      setCurrency(restaurant.currency_symbol || '₹');
      setThemeMode(restaurant.theme_mode || 'dark');
    }
  }, [restaurant]);

  const handleSave = () => save(supabase.entities.Restaurant.update(restaurant.id, {
    theme_primary_color: primary,
    theme_bg_color: bg,
    currency_symbol: currency,
    theme_mode: themeMode,
  }), onRefresh);

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-semibold">Theme</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label>Primary / Accent Color</Label>
          <div className="flex items-center gap-2 mt-1">
            <Input type="color" value={primary} onChange={e => setPrimary(e.target.value)} className="w-12 h-10 p-1" />
            <Input value={primary} onChange={e => setPrimary(e.target.value)} className="bg-secondary" />
          </div>
        </div>
        <div>
          <Label>Background Color</Label>
          <div className="flex items-center gap-2 mt-1">
            <Input type="color" value={bg} onChange={e => setBg(e.target.value)} className="w-12 h-10 p-1" />
            <Input value={bg} onChange={e => setBg(e.target.value)} className="bg-secondary" />
          </div>
        </div>
        <div>
          <Label>Currency Symbol</Label>
          <Input value={currency} onChange={e => setCurrency(e.target.value)} className="mt-1 bg-secondary" />
        </div>
      </div>

      <div className="glass rounded-xl p-4">
        <Label>Theme Mode</Label>
        <p className="text-xs text-muted-foreground mt-0.5 mb-3">Choose the active theme for your customer-facing menu.</p>
        <div className="flex gap-3">
          <button
            onClick={() => setThemeMode('dark')}
            className={`flex-1 py-3 rounded-xl border-2 transition-all ${themeMode === 'dark' ? 'border-primary bg-primary/10' : 'border-border'}`}
          >
            <span className="text-sm font-medium">🌙 Dark Mode</span>
          </button>
          <button
            onClick={() => setThemeMode('light')}
            className={`flex-1 py-3 rounded-xl border-2 transition-all ${themeMode === 'light' ? 'border-primary bg-primary/10' : 'border-border'}`}
          >
            <span className="text-sm font-medium">☀️ Light Mode</span>
          </button>
        </div>
      </div>
      <Button onClick={handleSave} disabled={saving} className="gap-2 bg-primary text-primary-foreground">
        <Save className="w-4 h-4" />
        <span>{saving ? 'Saving...' : saved ? 'Saved ✓' : 'Save'}</span>
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}