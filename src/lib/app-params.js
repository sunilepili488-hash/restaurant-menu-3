/**
 * app-params.js — stub (base44 removed)
 * Previously provided base44 app credentials from URL/localStorage.
 * No longer needed — Supabase config is used instead via supabaseClient.js
 */
export const appParams = {
  appId: null,
  token: null,
  functionsVersion: null,
  appBaseUrl: typeof window !== 'undefined' ? window.location.origin : '',
};
