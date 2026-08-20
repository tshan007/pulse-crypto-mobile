import { useEffect, useState } from "react";

/**
 * Samples the JS thread's actual frame rate via requestAnimationFrame.
 * This measures the JS thread specifically (matching the label used in the
 * design spec, "JS Thread Frame Rate") — it is not a measure of native UI
 * thread FPS, which RN doesn't expose without a native module. If the JS
 * thread is busy (e.g. a heavy re-render), this number will genuinely drop,
 * which is exactly the useful signal a developer wants from this gauge.
 */
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
