/**
 * supabaseClient.js
 * 
 * Dynamic Supabase client — reads URL + anon key from localStorage at runtime.
 * Each restaurant owner connects their own Supabase project via Admin Panel > Supabase section.
 * 
 * Storage keys:
 *   sb_url       — https://xxxxx.supabase.co
 *   sb_anon_key  — eyJhbGci...
 */

const STORAGE_KEY_URL = 'sb_url';
const STORAGE_KEY_ANON = 'sb_anon_key';

export function getSupabaseConfig() {
  return {
    url: localStorage.getItem(STORAGE_KEY_URL) || '',
    anonKey: localStorage.getItem(STORAGE_KEY_ANON) || '',
  };
}

export function setSupabaseConfig(url, anonKey) {
  localStorage.setItem(STORAGE_KEY_URL, url);
  localStorage.setItem(STORAGE_KEY_ANON, anonKey);
}

export function clearSupabaseConfig() {
  localStorage.removeItem(STORAGE_KEY_URL);
  localStorage.removeItem(STORAGE_KEY_ANON);
}

export function isSupabaseConfigured() {
  const { url, anonKey } = getSupabaseConfig();
  return !!(url && anonKey);
}

// Generic fetch wrapper for Supabase REST API
async function sbFetch(path, options = {}) {
  const { url, anonKey } = getSupabaseConfig();
  if (!url || !anonKey) throw new Error('Supabase not configured. Please connect via Admin Panel > Supabase.');

  const fullUrl = `${url}/rest/v1${path}`;
  const res = await fetch(fullUrl, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
      Prefer: options.prefer || '',
      ...options.headers,
    },
  });

  if (!res.ok) {
    let errMsg = `Supabase error: ${res.status}`;
    try { const j = await res.json(); errMsg = j.message || j.error || errMsg; } catch {}
    throw new Error(errMsg);
  }

  // DELETE / no-content returns empty
  if (res.status === 204 || res.headers.get('content-length') === '0') return null;

  return res.json();
}

// ─── Entity Factory ──────────────────────────────────────────────────────────
// Mirrors base44 entity API: list(), filter(), create(), update(), delete()

function makeEntity(tableName) {
  return {
    /** list(orderBy?, limit?) */
    async list(orderBy = 'created_at', limit = 1000) {
      const col = orderBy.startsWith('-') ? orderBy.slice(1) : orderBy;
      const asc = !orderBy.startsWith('-');
      const rows = await sbFetch(
        `/${tableName}?order=${col}.${asc ? 'asc' : 'desc'}&limit=${limit}`,
        { prefer: 'return=representation' }
      );
      return rows || [];
    },

    /** filter(where, orderBy?, limit?) */
    async filter(where = {}, orderBy = 'created_at', limit = 1000) {
      const col = orderBy.startsWith('-') ? orderBy.slice(1) : orderBy;
      const asc = !orderBy.startsWith('-');
      const params = Object.entries(where)
        .map(([k, v]) => `${k}=eq.${encodeURIComponent(v)}`)
        .join('&');
      const rows = await sbFetch(
        `/${tableName}?${params}&order=${col}.${asc ? 'asc' : 'desc'}&limit=${limit}`,
        { prefer: 'return=representation' }
      );
      return rows || [];
    },

    /** create(data) */
    async create(data) {
      const rows = await sbFetch(`/${tableName}`, {
        method: 'POST',
        prefer: 'return=representation',
        body: JSON.stringify(data),
      });
      return Array.isArray(rows) ? rows[0] : rows;
    },

    /** update(id, data) */
    async update(id, data) {
      const rows = await sbFetch(`/${tableName}?id=eq.${id}`, {
        method: 'PATCH',
        prefer: 'return=representation',
        body: JSON.stringify(data),
      });
      return Array.isArray(rows) ? rows[0] : rows;
    },

    /** delete(id) */
    async delete(id) {
      await sbFetch(`/${tableName}?id=eq.${id}`, { method: 'DELETE' });
      return true;
    },
  };
}

// ─── Image Upload via Supabase Storage ───────────────────────────────────────

export async function uploadFile(file, bucket = 'menu-images') {
  const { url, anonKey } = getSupabaseConfig();
  if (!url || !anonKey) throw new Error('Supabase not configured');

  const ext = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const res = await fetch(`${url}/storage/v1/object/${bucket}/${fileName}`, {
    method: 'POST',
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
      'Content-Type': file.type,
      'x-upsert': 'false',
    },
    body: file,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Upload failed');
  }

  // Return public URL
  const file_url = `${url}/storage/v1/object/public/${bucket}/${fileName}`;
  return { file_url };
}

// ─── Realtime subscription ────────────────────────────────────────────────────
// Simple polling wrapper (Supabase realtime requires ws — polling is safer for SaaS deploy)
// Components can use useQuery with refetchInterval instead.

// ─── Exported client object (mirrors base44 shape) ────────────────────────────

export const supabase = {
  entities: {
    Restaurant: makeEntity('restaurants'),
    Category: makeEntity('categories'),
    Dish: makeEntity('dishes'),
    Banner: makeEntity('banners'),
    Order: makeEntity('orders'),
    Review: makeEntity('reviews'),
    TableMapping: makeEntity('table_mappings'),
  },
  integrations: {
    Core: {
      UploadFile: ({ file }) => uploadFile(file),
    },
  },
};
