/**
 * base44Client.js — COMPATIBILITY SHIM
 * 
 * All imports of `base44` now point to the Supabase-backed client.
 * Nothing in the app changes — every `base44.entities.X.list()` call
 * automatically talks to the restaurant's own Supabase project.
 */
export { supabase as base44 } from './supabaseClient.js';
