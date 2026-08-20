import { useEffect } from "react";
import { useTelemetryStore } from "../store/telemetryStore";

/** Recomputes the real WS message rate every 500ms while mounted. */
export function useSocketMetrics() {
  const recomputeRate = useTelemetryStore((s) => s.recomputeRate);
  const messagesPerSecond = useTelemetryStore((s) => s.messagesPerSecond);

  useEffect(() => {
    const interval = setInterval(recomputeRate, 500);
    return () => clearInterval(interval);
  }, [recomputeRate]);

  return messagesPerSecond;
}
