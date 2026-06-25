import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function BannerCarousel({ banners = [] }) {
  const [current, setCurrent] = useState(0);
  const active = banners.filter(b => b.is_active !== false);

  const next = useCallback(() => {
    if (active.length <= 1) return;
    setCurrent(prev => (prev + 1) % active.length);
  }, [active.length]);

  useEffect(() => {
    if (active.length <= 1) return;
    const interval = setInterval(next, 4000);
    return () => clearInterval(interval);
  }, [next, active.length]);

  if (active.length === 0) return null;

  const banner = active[current];

  return (
    <div className="mx-4 mt-4 mb-2">
      <div className="relative h-32 md:h-40 rounded-2xl overflow-hidden" style={{ pointerEvents: 'none' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center"
            style={{
              background: banner.image_url
                ? `linear-gradient(135deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.2) 100%), url(${banner.image_url}) center/cover`
                : `linear-gradient(135deg, ${banner.bg_color || 'hsl(38,45%,61%)'}, ${banner.bg_color || 'hsl(38,45%,61%)'}88)`,
            }}
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -60 }}
            transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <h3
              className="font-display text-xl md:text-2xl font-bold"
              style={{ color: banner.text_color || '#fff' }}
            >
              {banner.title}
            </h3>
            {banner.subtitle && (
              <p
                className="text-sm mt-1 opacity-90"
                style={{ color: banner.text_color || '#fff' }}
              >
                {banner.subtitle}
              </p>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Dots */}
        {active.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
            {active.map((_, i) => (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  i === current ? 'bg-white w-4' : 'bg-white/40'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}