import { useEffect, useState } from "react";

/** Samples the JS thread's frame rate via requestAnimationFrame (not native UI thread FPS). */
export function useFrameRate(sampleWindowMs = 1000) {
  const [fps, setFps] = useState(60);

  useEffect(() => {
    let frameCount = 0;
    let windowStart = Date.now();
    let rafHandle: number;
    let cancelled = false;

    const tick = () => {
      if (cancelled) return;
      frameCount += 1;
      const now = Date.now();
      const elapsed = now - windowStart;
      if (elapsed >= sampleWindowMs) {
        setFps(Math.round((frameCount * 1000) / elapsed));
        frameCount = 0;
        windowStart = now;
      }
      rafHandle = requestAnimationFrame(tick);
    };

    rafHandle = requestAnimationFrame(tick);
    return () => {
      cancelled = true;
      cancelAnimationFrame(rafHandle);
    };
  }, [sampleWindowMs]);

  return fps;
}
