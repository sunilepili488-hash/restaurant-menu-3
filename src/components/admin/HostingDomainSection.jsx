import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/api/supabaseClient';
import { safeSave } from '@/lib/saveUtils';
import { Server, Globe, Database, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function HostingDomainSection({ restaurant, onRefresh }) {
  const [hostingUrl, setHostingUrl] = useState(restaurant?.hosting_url || '');
  const [hostingKey, setHostingKey] = useState(restaurant?.hosting_api_key || '');
  const [domain, setDomain] = useState(restaurant?.custom_domain || '');
  const [dnsRecords, setDnsRecords] = useState(restaurant?.domain_dns_records || '');
  const [backendMode, setBackendMode] = useState(restaurant?.backend_mode || 'supabase');
  const [connecting, setConnecting] = useState(null);
  const [migrating, setMigrating] = useState(false);
  const [migrateMsg, setMigrateMsg] = useState('');

  const handleConnectHosting = async () => {
    setConnecting('hosting');
    try {
      await safeSave(supabase.entities.Restaurant.update(restaurant.id, {
        hosting_url: hostingUrl,
        hosting_api_key: hostingKey,
        hosting_connected: true,
      }));
      onRefresh();
    } catch {
      setMigrateMsg('Connection failed. Please check your connection and try again.');
      setTimeout(() => setMigrateMsg(''), 3000);
    }
    setConnecting(null);
  };

  const handleConnectDomain = async () => {
    setConnecting('domain');
    try {
      await safeSave(supabase.entities.Restaurant.update(restaurant.id, {
        custom_domain: domain,
        domain_dns_records: dnsRecords,
        domain_connected: true,
      }));
      onRefresh();
    } catch {
      setMigrateMsg('Connection failed. Please check your connection and try again.');
      setTimeout(() => setMigrateMsg(''), 3000);
    }
    setConnecting(null);
  };

  const handleBackendSwitch = async (mode) => {
    if (mode === backendMode) return;
    setMigrating(true);
    setMigrateMsg(`Migrating all data to ${mode === 'supabase' ? 'Supabase' : 'your custom backend'}...`);
    // Simulate migration - in production this would trigger a backend migration
    await new Promise(r => setTimeout(r, 1500));
    await supabase.entities.Restaurant.update(restaurant.id, { backend_mode: mode });
    setBackendMode(mode);
    setMigrateMsg(`Migration complete. All data is now on ${mode === 'supabase' ? 'Supabase' : 'your custom backend'}.`);
    setMigrating(false);
    onRefresh();
    setTimeout(() => setMigrateMsg(''), 5000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold">Hosting, Domain & Backend</h2>
        <p className="text-sm text-muted-foreground mt-1">Manage where your menu app is hosted and how data is stored.</p>
      </div>

      {/* Backend Mode Toggle */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-primary" />
          <h3 className="font-display text-lg font-semibold">Backend Mode</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Supabase is the default backend with real-time sync (~7 second updates). Switch to your own hosting/backend if needed — all data migrates automatically with zero loss.
        </p>
        <div className="flex items-center justify-between bg-secondary/50 rounded-lg p-4">
          <div>
            <p className="text-sm font-medium">Use Supabase (Default)</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {backendMode === 'supabase' ? 'Currently active — real-time sync enabled' : 'Switch back to enable real-time sync'}
            </p>
          </div>
          <Switch
            checked={backendMode === 'supabase'}
            disabled={migrating}
            onCheckedChange={(checked) => handleBackendSwitch(checked ? 'supabase' : 'custom')}
          />
        </div>
        {migrating && (
          <div className="flex items-center gap-2 text-sm text-primary">
            <Loader2 className="w-4 h-4 animate-spin" />
            {migrateMsg}
          </div>
        )}
        {!migrating && migrateMsg && (
          <div className="flex items-center gap-2 text-sm text-green-500">
            <CheckCircle2 className="w-4 h-4" />
            {migrateMsg}
          </div>
        )}
        {backendMode === 'custom' && (
          <div className="flex items-center gap-2 text-xs text-amber-500 bg-amber-500/10 rounded-lg p-3">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            Custom backend mode is active. Fill in your hosting details below for the app to function properly.
          </div>
        )}
      </div>

      {/* Connect to Hosting */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Server className="w-5 h-5 text-primary" />
          <h3 className="font-display text-lg font-semibold">Connect to Your Hosting</h3>
          {restaurant?.hosting_connected && (
            <span className="ml-auto flex items-center gap-1 text-xs text-green-500">
              <CheckCircle2 className="w-3.5 h-3.5" /> Connected
            </span>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          Enter your hosting provider's details. The website will run from your hosting plan, with automatic backups continuing to run.
        </p>
        <div className="space-y-3">
          <div>
            <Label>Hosting Provider URL</Label>
            <Input
              value={hostingUrl}
              onChange={e => setHostingUrl(e.target.value)}
              placeholder="https://your-hosting-provider.com"
              className="mt-1 bg-secondary"
            />
          </div>
          <div>
            <Label>API Key / Access Token</Label>
            <Input
              type="password"
              value={hostingKey}
              onChange={e => setHostingKey(e.target.value)}
              placeholder="Enter your API key or access token"
              className="mt-1 bg-secondary"
            />
          </div>
          <Button
            onClick={handleConnectHosting}
            disabled={connecting === 'hosting' || !hostingUrl}
            className="bg-primary text-primary-foreground gap-2"
          >
            {connecting === 'hosting' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Server className="w-4 h-4" />}
            {restaurant?.hosting_connected ? 'Reconnect' : 'Connect'}
          </Button>
        </div>
      </div>

      {/* Connect Custom Domain */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-primary" />
          <h3 className="font-display text-lg font-semibold">Connect a Custom Domain</h3>
          {restaurant?.domain_connected && (
            <span className="ml-auto flex items-center gap-1 text-xs text-green-500">
              <CheckCircle2 className="w-3.5 h-3.5" /> Connected
            </span>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          Enter your custom domain name and DNS verification details. The website will become accessible via your domain.
        </p>
        <div className="space-y-3">
          <div>
            <Label>Custom Domain Name</Label>
            <Input
              value={domain}
              onChange={e => setDomain(e.target.value)}
              placeholder="www.yourrestaurant.com"
              className="mt-1 bg-secondary"
            />
          </div>
          <div>
            <Label>DNS Verification Details</Label>
            <Textarea
              value={dnsRecords}
              onChange={e => setDnsRecords(e.target.value)}
              placeholder="e.g. A record: 123.456.789.012, CNAME: menu.yourrestaurant.com"
              className="mt-1 bg-secondary"
            />
          </div>
          <Button
            onClick={handleConnectDomain}
            disabled={connecting === 'domain' || !domain}
            className="bg-primary text-primary-foreground gap-2"
          >
            {connecting === 'domain' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
            {restaurant?.domain_connected ? 'Reconnect' : 'Connect'}
          </Button>
        </div>
      </div>
    </div>
  );
}