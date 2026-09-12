import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Mobile check — project ka existing hook use kar raha hai
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return isMobile;
}

export default function SplashScreen({ restaurant, onComplete }) {
  const videoRef = useRef(null);
  const [visible, setVisible] = useState(true);
  const isMobile = useIsMobile();

  const handleFinish = () => {
    setVisible(false);
    setTimeout(onComplete, 500);
  };

  // ── MOBILE: video ends → menu open ──
  useEffect(() => {
    if (!isMobile) return;
    const video = videoRef.current;
    if (!video) return;
    video.addEventListener('ended', handleFinish);
    return () => video.removeEventListener('ended', handleFinish);
  }, [isMobile]);

  // ── DESKTOP/TABLET: purani timing wali animation ──
  useEffect(() => {
    if (isMobile) return;
    const timer = setTimeout(() => setVisible(false), 2800);
    return () => clearTimeout(timer);
  }, [isMobile]);

  useEffect(() => {
    if (!visible) {
      const t = setTimeout(onComplete, 500);
      return () => clearTimeout(t);
    }
  }, [visible, onComplete]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[100] overflow-hidden"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >

          {/* ══════════════════════════════
              MOBILE → VIDEO
          ══════════════════════════════ */}
          {isMobile && (
            <div className="w-full h-full bg-black">
              <video
                ref={videoRef}
                src="/intro.mp4"
                className="w-full h-full object-cover"
                autoPlay
                muted
                playsInline
                preload="auto"
              />
              {/* Skip button */}
              <motion.button
                onClick={handleFinish}
                className="absolute bottom-8 right-6 text-white/70 text-sm border border-white/30 px-4 py-1.5 rounded-full backdrop-blur-sm hover:bg-white/10 transition-all"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
              >
                Skip ›
              </motion.button>
            </div>
          )}

          {/* ══════════════════════════════
              DESKTOP / TABLET → PURANI ANIMATION
          ══════════════════════════════ */}
          {!isMobile && (
            <div className="w-full h-full flex flex-col items-center justify-center bg-background">

              {/* Background glow */}
              <motion.div
                className="absolute w-[500px] h-[500px] rounded-full opacity-20"
                style={{ background: 'radial-gradient(circle, hsl(38 45% 61%) 0%, transparent 70%)' }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1.5, opacity: 0.15 }}
                transition={{ duration: 2, ease: 'easeOut' }}
              />

              {/* Gold line */}
              <motion.div
                className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1.5, delay: 0.3, ease: 'easeOut' }}
              />

              {/* Logo / Name */}
              <motion.div
                className="relative z-10 flex flex-col items-center gap-4"
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              >
                {restaurant?.logo_url && (
                  <motion.img
                    src={restaurant.logo_url}
                    alt={restaurant.name}
                    className="w-24 h-24 object-contain"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                  />
                )}
                <motion.h1
                  className="font-display text-4xl md:text-5xl font-semibold text-primary tracking-wide text-center"
                  initial={{ opacity: 0, letterSpacing: '0.3em' }}
                  animate={{ opacity: 1, letterSpacing: '0.08em' }}
                  transition={{ duration: 1, delay: 0.5 }}
                >
                  {restaurant?.name || 'Welcome'}
                </motion.h1>
                <motion.div
                  className="w-32 h-px gold-shimmer"
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 128 }}
                  transition={{ duration: 0.8, delay: 0.8 }}
                />
                <motion.p
                  className="text-muted-foreground text-sm font-body tracking-widest uppercase mt-2 text-center px-8"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1 }}
                >
                  {restaurant?.welcome_message || 'A Culinary Experience Awaits'}
                </motion.p>
              </motion.div>

              {/* Bottom dots */}
              <motion.div
                className="absolute bottom-16 flex gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
              >
                {[0, 1, 2].map(i => (
                  <motion.div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-primary/60"
                    animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                  />
                ))}
              </motion.div>
            </div>
          )}

        </motion.div>
      )}
    </AnimatePresence>
  );
}
