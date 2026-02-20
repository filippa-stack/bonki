import { useState, useEffect, useRef, useCallback } from 'react';

/** Returns a 0→1 progress value based on scroll position (clamped). */
export function useScrollCompression(threshold = 80) {
  const [progress, setProgress] = useState(0);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const raf = useRef<number>(0);

  const handleScroll = useCallback(() => {
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => {
      const el = scrollRef.current;
      if (!el) return;
      const y = el.scrollTop;
      setProgress(Math.min(y / threshold, 1));
    });
  }, [threshold]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      el.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(raf.current);
    };
  }, [handleScroll]);

  return { scrollRef, progress };
}
