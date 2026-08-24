import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useMarketStore } from "../store/marketStore";
import { useTelemetryStore } from "../store/telemetryStore";
import { computeAdaptiveIntervalMs } from "../utils/adaptivePolling";
import { usePairScope } from "../hooks/usePairScope";
import { ConnectionStatusBadge } from "../components/common/ConnectionStatusBadge";
import { MetricCard, SectionEyebrow } from "../components/telemetry/MetricCard";
import { ThrottleSlider } from "../components/telemetry/ThrottleSlider";
import { ToggleRow } from "../components/telemetry/ToggleRow";
import { theme } from "../theme";

export function SettingsScreen() {
  const socketStatus = useMarketStore((s) => s.socketStatus);
  // This screen doesn't render per-pair data, just throttling controls.
  usePairScope([]);

  const fps = useTelemetryStore((s) => s.fps);
  const appState = useTelemetryStore((s) => s.appState);
  const updateIntervalMs = useTelemetryStore((s) => s.updateIntervalMs);
  const setUpdateIntervalMs = useTelemetryStore((s) => s.setUpdateIntervalMs);
  const compressionEnabled = useTelemetryStore((s) => s.compressionEnabled);
  const setCompressionEnabled = useTelemetryStore((s) => s.setCompressionEnabled);
  const adaptivePolling = useTelemetryStore((s) => s.adaptivePolling);
  const setAdaptivePolling = useTelemetryStore((s) => s.setAdaptivePolling);

  // Actual cadence in effect right now: the manual slider value, or — when
  // adaptive polling is on — a value computed from live FPS/foreground
  // state. useMarketSocket sends this same computation to the backend.
  const effectiveIntervalMs = adaptivePolling
    ? computeAdaptiveIntervalMs(fps, appState)
    : updateIntervalMs;

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
          <ConnectionStatusBadge status={socketStatus} />
        </View>
        <Text style={styles.subtitle}>Data ingestion controls for the live market feed.</Text>

        <MetricCard>
          <SectionEyebrow color={theme.colors.positive}>Network control</SectionEyebrow>
          <Text style={styles.cardTitle}>Data Throttling Configurator</Text>
          <View style={{ height: theme.spacing.md }} />
          <ThrottleSlider
            value={effectiveIntervalMs}
            onValueChange={setUpdateIntervalMs}
            disabled={adaptivePolling}
          />
          <Text style={styles.disclaimer}>
            {adaptivePolling
              ? "Interval is computed automatically from live FPS and app foreground state."
              : "Requested from the backend; it can only be throttled down from the server's base broadcast tick, never faster."}
          </Text>
          <ToggleRow
            label="Binary Protocol Compression"
            value={compressionEnabled}
            onValueChange={setCompressionEnabled}
            note={compressionEnabled ? "Payloads sent as msgpack binary frames" : "Payloads sent as plain JSON"}
          />
          <ToggleRow
            label="Adaptive Polling Strategy"
            value={adaptivePolling}
            onValueChange={setAdaptivePolling}
            note={adaptivePolling ? "Interval auto-tunes from FPS + foreground state" : "Manual interval via slider above"}
          />
        </MetricCard>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    ...theme.typography.headingLarge,
    color: theme.colors.textPrimary,
  },
  subtitle: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.lg,
  },
  cardTitle: {
    ...theme.typography.headingSmall,
    color: theme.colors.textPrimary,
  },
  disclaimer: {
    color: theme.colors.textMuted,
    fontSize: 11,
    marginTop: theme.spacing.sm,
    fontStyle: "italic",
  },
});
