/**
 * SupabaseGate.jsx
 * 
 * If Supabase is NOT configured (first time setup), shows a connect screen.
 * Once connected, renders children normally.
 * 
 * This is the ONLY entry point for first-time restaurant setup.
 */
import React, { useState, useEffect } from 'react';
import { setSupabaseConfig, isSupabaseConfigured, getSupabaseConfig } from '@/api/supabaseClient';
import { Database, Wifi, Check, Loader2, ArrowRight, ExternalLink } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export default function SupabaseGate({ children }) {
  const [configured, setConfigured] = useState(false);
  const [checking, setChecking] = useState(true);

  // Step state for setup flow
  const [step, setStep] = useState(1); // 1=enter creds, 2=verify, 3=done
  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const ok = isSupabaseConfigured();
    setConfigured(ok);
    if (ok) {
      const { url: u, anonKey: k } = getSupabaseConfig();
      setUrl(u);
      setAnonKey(k);
    }
    setChecking(false);
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
        setVerified(true);
        setStep(2);
      } else {
        setError('Connection failed. Please check your URL and Anon Key.');
      }
    } catch {
      setError('Could not reach Supabase. Check the Project URL.');
    }
    setVerifying(false);
  };

  const handleConnect = () => {
    setSupabaseConfig(url.trim(), anonKey.trim());
    setStep(3);
    setTimeout(() => setConfigured(true), 1200);
  };

  if (checking) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!configured) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">

          {/* Logo / Header */}
          <div className="text-center space-y-2">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center">
              <Database className="w-8 h-8 text-primary" />
            </div>
            <h1 className="font-display text-2xl font-semibold">Connect Your Database</h1>
            <p className="text-sm text-muted-foreground">
              Link your Supabase project to power this restaurant menu.
            </p>
          </div>

          {/* Step 1: Enter credentials */}
          {step === 1 && (
            <div className="space-y-4 glass rounded-2xl p-6">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-bold">1</span>
                Enter your Supabase project credentials
              </div>

              <div>
                <Label className="text-sm">Supabase Project URL</Label>
                <Input
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  placeholder="https://xxxxxxxxxxxx.supabase.co"
                  className="mt-1.5 bg-secondary font-mono text-xs"
                />
              </div>

              <div>
                <Label className="text-sm">Anon / Public Key</Label>
                <Input
                  value={anonKey}
                  onChange={e => setAnonKey(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  className="mt-1.5 bg-secondary font-mono text-xs"
                />
              </div>

              {error && <p className="text-xs text-destructive">{error}</p>}

              <Button
                onClick={handleVerify}
                disabled={verifying}
                className="w-full gap-2 bg-primary text-primary-foreground"
              >
                {verifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wifi className="w-4 h-4" />}
                {verifying ? 'Verifying...' : 'Verify Connection'}
              </Button>

              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <ExternalLink className="w-3 h-3" /> Get credentials from Supabase Dashboard
              </a>
            </div>
          )}

          {/* Step 2: Confirm */}
          {step === 2 && (
            <div className="space-y-4 glass rounded-2xl p-6">
              <div className="flex items-center gap-2 text-xs text-green-500 mb-2">
                <Check className="w-4 h-4" /> Connection verified successfully!
              </div>

              <div className="bg-secondary rounded-xl p-3 space-y-1">
                <p className="text-xs text-muted-foreground">Project URL</p>
                <p className="text-xs font-mono break-all">{url}</p>
              </div>

              <p className="text-xs text-muted-foreground">
                Make sure you have run the SQL setup script in your Supabase SQL Editor to create the required tables.
              </p>

              <div className="flex gap-3">
                <Button onClick={() => setStep(1)} variant="outline" className="flex-1">
                  ← Back
                </Button>
                <Button onClick={handleConnect} className="flex-1 gap-2 bg-primary text-primary-foreground">
                  <ArrowRight className="w-4 h-4" /> Connect & Launch
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Done */}
          {step === 3 && (
            <div className="glass rounded-2xl p-6 text-center space-y-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-green-500/20 flex items-center justify-center">
                <Check className="w-7 h-7 text-green-500" />
              </div>
              <p className="font-display text-lg font-semibold">Connected!</p>
              <p className="text-sm text-muted-foreground">Loading your menu...</p>
              <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
            </div>
          )}

          {/* Help note */}
          <p className="text-center text-xs text-muted-foreground">
            Each restaurant uses their own Supabase project — your data stays yours.
          </p>
        </div>
      </div>
    );
  }

  return children;
}
