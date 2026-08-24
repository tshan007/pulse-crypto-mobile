import { useEffect, useRef, useState } from "react";
import DeviceInfo from "react-native-device-info";

const SAMPLE_INTERVAL_MS = 2000;
const MAX_SAMPLES = 12;

/**
 * Samples real used memory on an interval and keeps a rolling window for
 * the telemetry sparkline. This is device-wide usage, not JS-heap-only —
 * iOS has no public API for per-app memory, so react-native-device-info
 * reports whole-device usage on both platforms.
 */
export function useDeviceMemory() {
  const [series, setSeries] = useState<number[]>([]);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    const sample = async () => {
      try {
        const usedBytes = await DeviceInfo.getUsedMemory();
        if (!mountedRef.current) return;
        const usedMB = usedBytes / (1024 * 1024);
        setSeries((prev) => [...prev, usedMB].slice(-MAX_SAMPLES));
      } catch {
        // sample skipped — e.g. unsupported platform/emulator
      }
    };

    sample();
    const interval = setInterval(sample, SAMPLE_INTERVAL_MS);
    return () => {
      mountedRef.current = false;
      clearInterval(interval);
    };
  }, []);

  return series;
}
