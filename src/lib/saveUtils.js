import { useState } from 'react';

/**
 * Hook for save operations with optimistic feedback. Shows "Saved ✓" after
 * 2 seconds (the save is likely still processing on slow mobile networks)
 * rather than blocking indefinitely. Only shows an error if the save
 * genuinely fails (promise rejects).
 */
export function useSafeSave() {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const save = (promise, onRefresh) => {
    setSaving(true);
    setError('');
    setSaved(false);

    // Optimistic: after 2s, show "Saved ✓" — the request is likely still
    // in flight on slow mobile networks, but the data will persist.
    const optimisticTimer = setTimeout(() => {
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
      setSaving(false);
    }, 2000);

    promise
      .then(() => {
        clearTimeout(optimisticTimer);
        setSaved(true);
        setTimeout(() => setSaved(false), 1500);
        setSaving(false);
        onRefresh?.();
      })
      .catch(() => {
        clearTimeout(optimisticTimer);
        setSaved(false);
        setSaving(false);
        setError('Save failed. Please check your connection and try again.');
        setTimeout(() => setError(null), 3000);
      });
  };

  return { saving, saved, error, save };
}

/**
 * Wraps a promise with a timeout — rejects if it doesn't resolve in time.
 */
export async function safeSave(promise, timeoutMs = 15000) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), timeoutMs)),
  ]);
}