/**
 * SupabaseSection.jsx — Admin Panel > Supabase Settings
 * 
 * Lets the restaurant owner view connection status, change credentials,
 * or disconnect. Config is stored in localStorage (sb_url, sb_anon_key).
 */
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  getSupabaseConfig,
  setSupabaseConfig,
  clearSupabaseConfig,
  isSupabaseConfigured,
} from '@/api/supabaseClient';
import { Database, Check, Loader2, ArrowRight, ArrowLeft, Wifi, AlertTriangle } from 'lucide-react';

export default function SupabaseSection({ restaurant, onRefresh }) {
  const [step, setStep] = useState(1);
  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');
  const connected = isSupabaseConfigured();

  useEffect(() => {
    if (connected) {
      const { url: u, anonKey: k } = getSupabaseConfig();
      setUrl(u);
      setAnonKey(k);
    }
  }, []);

  const handleVerify = async () => {
    setError('');
    if (!url.trim() || !anonKey.trim()) {
      setError('Please enter both Project URL and Anon Key.');
      return;
    }
    setVerifying(true);
    try {
      const resp = await fetch(`${url.trim()}/rest/v1/`, {
        headers: {
          apikey: anonKey.trim(),
          Authorization: `Bearer ${anonKey.trim()}`,
        },
      });
      if (resp.ok || resp.status === 404 || resp.status === 406 || resp.status === 400) {
        setStep(2);
      } else {
        setError('Connection failed. Check your URL and key.');
      }
    } catch {
      setError('Could not reach Supabase. Check the Project URL.');
    }
    setVerifying(false);
  };

  const handleConfirm = () => {
    setSupabaseConfig(url.trim(), anonKey.trim());
    onRefresh?.();
    setStep(3);
  };

  const handleDisconnect = () => {
    if (!window.confirm('Disconnect Supabase? The page will reload and you will need to reconnect to use the app.')) return;
    clearSupabaseConfig();
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-semibold">Supabase Backend</h2>

      {/* Status */}
      <div className={`glass rounded-2xl p-5 flex items-center gap-4 ${connected ? 'border-green-500/30' : ''}`}>
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${connected ? 'bg-green-500/20' : 'bg-secondary'}`}>
          {connected ? <Check className="w-6 h-6 text-green-500" /> : <Database className="w-6 h-6 text-muted-foreground" />}
        </div>
        <div>
          <p className="font-medium">{connected ? 'Connected to Supabase' : 'Not Connected'}</p>
          <p className="text-xs text-muted-foreground">
            {connected
              ? `Project: ${getSupabaseConfig().url}`
              : 'Connect your Supabase project for live database sync.'}
          </p>
        </div>
      </div>

      {connected && step !== 3 && (
        <div className="space-y-3">
          <Button onClick={handleDisconnect} variant="outline" className="gap-2 text-destructive border-destructive/30">
            <AlertTriangle className="w-4 h-4" /> Disconnect Supabase
          </Button>
          <p className="text-xs text-muted-foreground">
            Or update credentials below and click Verify → Confirm to switch to a different project.
          </p>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4">
          <div>
            <Label>Supabase Project URL</Label>
            <Input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://xxxxx.supabase.co" className="mt-1 bg-secondary font-mono text-xs" />
          </div>
          <div>
            <Label>Anon / Public Key</Label>
            <Input value={anonKey} onChange={e => setAnonKey(e.target.value)} placeholder="eyJhbGci..." className="mt-1 bg-secondary font-mono text-xs" />
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
          <Button onClick={handleVerify} disabled={verifying} className="gap-2 bg-primary text-primary-foreground">
            {verifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wifi className="w-4 h-4" />}
            {verifying ? 'Verifying...' : 'Verify Connection'}
          </Button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-green-500">
            <Check className="w-5 h-5" /> Connection verified!
          </div>
          <div className="glass rounded-xl p-4 space-y-2">
            <p className="text-xs text-muted-foreground">Project URL</p>
            <p className="text-sm font-mono break-all">{url}</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => setStep(1)} variant="outline" className="gap-2"><ArrowLeft className="w-4 h-4" /> Back</Button>
            <Button onClick={handleConfirm} className="flex-1 gap-2 bg-primary text-primary-foreground">
              <ArrowRight className="w-4 h-4" /> Confirm & Save
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-green-500/20 flex items-center justify-center">
            <Check className="w-8 h-8 text-green-500" />
          </div>
          <p className="font-display text-lg font-semibold">Supabase Updated!</p>
          <p className="text-sm text-muted-foreground">Your app now uses the new Supabase project.</p>
          <Button onClick={() => setStep(1)} variant="outline">Back to Settings</Button>
        </div>
      )}
    </div>
  );
}
