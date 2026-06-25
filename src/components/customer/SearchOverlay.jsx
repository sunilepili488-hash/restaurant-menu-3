import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';

const UNLOCK_PHRASE = 'hide user';

export default function SearchOverlay({ open, onClose, dishes = [], onSelect, onUnlock }) {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [open]);

  const isUnlockQuery = query.trim().toLowerCase() === UNLOCK_PHRASE;

  const filtered = (query.length > 0 && !isUnlockQuery)
    ? dishes.filter(d =>
        d.name.toLowerCase().includes(query.toLowerCase()) ||
        (d.short_description || '').toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && isUnlockQuery) {
      onUnlock?.();
      setQuery('');
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] bg-background/95"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="max-w-lg mx-auto px-4 pt-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  ref={inputRef}
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search dishes..."
                  className="pl-10 bg-secondary border-border/50 font-body"
                />
              </div>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="w-10 h-10 rounded-full glass flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </motion.button>
            </div>

            <div className="space-y-2 max-h-[70vh] overflow-y-auto">
              {filtered.map(dish => (
                <motion.button
                  key={dish.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => { onSelect?.(dish); onClose(); }}
                  className="w-full glass rounded-xl p-3 flex items-center gap-3 text-left hover:bg-secondary/50 transition-colors"
                >
                  {dish.image_url && (
                    <img src={dish.image_url} alt="" className="w-12 h-12 rounded-lg object-cover" loading="lazy" />
                  )}
                  <div className="min-w-0">
                    <p className="font-display text-sm font-semibold truncate">{dish.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{dish.short_description}</p>
                  </div>
                </motion.button>
              ))}
              {query && !isUnlockQuery && filtered.length === 0 && (
                <p className="text-center text-muted-foreground text-sm py-8">No dishes found</p>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}