import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/api/supabaseClient';
import { useSafeSave } from '@/lib/saveUtils';
import { Save, Upload } from 'lucide-react';

export default function BrandingSection({ restaurant, onRefresh }) {
  const [form, setForm] = useState({
    name: '', logo_url: '', welcome_message: '', operating_hours: '',
    admin_username: '', admin_password: '', hide_user_icon: false, splash_custom_code: '',
  });
  const { saving, saved, error, save } = useSafeSave();

  useEffect(() => {
    if (restaurant) {
      setForm({
        name: restaurant.name || '',
        logo_url: restaurant.logo_url || '',
        welcome_message: restaurant.welcome_message || '',
        operating_hours: restaurant.operating_hours || '',
        admin_username: restaurant.admin_username || 'admin',
        admin_password: restaurant.admin_password || 'admin123',
        hide_user_icon: restaurant.hide_user_icon || false,
        splash_custom_code: restaurant.splash_custom_code || '',
      });
    }
  }, [restaurant]);

  const handleSave = () => save(supabase.entities.Restaurant.update(restaurant.id, form), onRefresh);

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const { file_url } = await supabase.integrations.Core.UploadFile({ file });
    setForm(f => ({ ...f, logo_url: file_url }));
  };

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-semibold">Branding and Settings</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label>Restaurant Name</Label>
            <Input value={form.name} onChange={e => set('name', e.target.value)} className="mt-1 bg-secondary" />
          </div>
          <div>
            <Label>Logo</Label>
            <div className="mt-1 flex items-center gap-3">
              {form.logo_url && (
                <img src={form.logo_url} alt="" className="w-12 h-12 rounded-lg object-contain bg-secondary" />
              )}
              <label className="cursor-pointer">
                <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                <span className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary text-sm hover:bg-secondary/80 transition-colors">
                  <Upload className="w-4 h-4" /> Upload
                </span>
              </label>
            </div>
          </div>
          <div>
            <Label>Welcome Message</Label>
            <Input value={form.welcome_message} onChange={e => set('welcome_message', e.target.value)} className="mt-1 bg-secondary" />
          </div>
          <div>
            <Label>Operating Hours</Label>
            <Input value={form.operating_hours} onChange={e => set('operating_hours', e.target.value)} placeholder="Mon-Sun 11 AM - 11 PM" className="mt-1 bg-secondary" />
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <Label>Admin Username</Label>
            <Input value={form.admin_username} onChange={e => set('admin_username', e.target.value)} className="mt-1 bg-secondary" />
          </div>
          <div>
            <Label>Admin Password</Label>
            <Input type="password" value={form.admin_password} onChange={e => set('admin_password', e.target.value)} className="mt-1 bg-secondary" />
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-secondary">
            <div>
              <p className="text-sm font-medium">Hide User Icon</p>
              <p className="text-xs text-muted-foreground">Hides admin access from customers</p>
            </div>
            <Switch checked={form.hide_user_icon} onCheckedChange={v => set('hide_user_icon', v)} />
          </div>
        </div>
      </div>

      <div>
        <Label>Splash Screen Custom Code</Label>
        <Textarea
          value={form.splash_custom_code}
          onChange={e => set('splash_custom_code', e.target.value)}
          className="mt-1 bg-secondary font-mono text-xs min-h-[150px]"
          placeholder="Custom HTML/CSS/JS for splash animation"
        />
      </div>

      <Button onClick={handleSave} disabled={saving} className="gap-2 bg-primary text-primary-foreground">
        <Save className="w-4 h-4" />
        <span>{saving ? 'Saving...' : saved ? 'Saved ✓' : 'Save Changes'}</span>
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}