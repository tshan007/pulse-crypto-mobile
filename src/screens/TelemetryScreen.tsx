import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useMarketStore } from "../store/marketStore";
import { useTelemetryStore } from "../store/telemetryStore";
import { useSocketMetrics } from "../hooks/useSocketMetrics";
import { usePairScope } from "../hooks/usePairScope";
import { ConnectionStatusBadge } from "../components/common/ConnectionStatusBadge";
import { RingGauge } from "../components/telemetry/RingGauge";
import { MetricCard, SectionEyebrow } from "../components/telemetry/MetricCard";
import { Sparkline } from "../components/telemetry/Sparkline";
import { InfoRow } from "../components/telemetry/InfoRow";
import { theme } from "../theme";

// Static placeholder series for the memory tracker. Real JS heap sampling
// isn't reliably available cross-platform in a managed Expo app (Hermes
// doesn't expose `performance.memory`) — rather than fabricate live-looking
// numbers, this is a fixed, clearly-artificial dataset until a native
// module (or a dev-only JSC-specific check) is deliberately added.
const PLACEHOLDER_MEMORY_SERIES = [98, 102, 101, 108, 112, 110, 118, 124, 121, 130, 128, 140];

export function TelemetryScreen() {
  const socketStatus = useMarketStore((s) => s.socketStatus);
  const messagesPerSecond = useSocketMetrics();
  const fps = useTelemetryStore((s) => s.fps);
  // This dashboard doesn't render per-pair data — messagesPerSecond/fps come
  // from telemetryStore either way, so there's no reason to receive it.
  usePairScope([]);

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Telemetry</Text>
          <ConnectionStatusBadge status={socketStatus} />
        </View>
        <Text style={styles.subtitle}>Real-time performance monitoring.</Text>

        <MetricCard>
          <View style={styles.dashboardHeader}>
            <View>
              <SectionEyebrow color={theme.colors.negative}>System telemetry</SectionEyebrow>
              <Text style={styles.cardTitle}>Performance Dashboard</Text>
            </View>
            <View style={styles.healthyBadge}>
              <Text style={styles.healthyText}>Healthy</Text>
            </View>
          </View>

          <View style={styles.gaugeWrap}>
            <RingGauge value={fps} maxValue={60} label="JS Thread Frame Rate" unit="FPS" />
          </View>

          <View style={{ height: theme.spacing.xl }} />

          <View style={styles.metricBlock}>
            <Text style={styles.metricValue}>{messagesPerSecond.toFixed(1)}</Text>
            <Text style={styles.metricUnit}>msgs/sec</Text>
            <Text style={styles.metricLabel}>WS Message Ingestion Rate</Text>
          </View>

          <View style={{ height: theme.spacing.lg }} />

          <View style={styles.metricBlock}>
            <View style={styles.memoryHeader}>
              <Text style={styles.metricLabel}>Memory Footprint Tracker</Text>
              <Text style={styles.memoryValue}>~{PLACEHOLDER_MEMORY_SERIES.at(-1)} MB</Text>
            </View>
            <Sparkline data={PLACEHOLDER_MEMORY_SERIES} color={theme.colors.negative} />
            <Text style={styles.disclaimer}>Placeholder data — real JS heap sampling isn't available on Hermes.</Text>
          </View>
        </MetricCard>

        <View style={{ height: theme.spacing.lg }} />

        <InfoRow
          icon="R"
          iconBackground={theme.palette.secondary[900]}
          iconColor={theme.colors.positive}
          title="Rendering pipeline"
          subtitle="Native RN views — no WebGL/GL context in use"
        />
        <View style={{ height: theme.spacing.sm }} />
        <InfoRow
          icon="L"
          iconBackground={theme.palette.tertiary[900]}
          iconColor={theme.colors.negative}
          title="API latency"
          subtitle="Placeholder — real ping not yet instrumented"
        />
        <View style={{ height: theme.spacing.sm }} />
        <InfoRow
          icon="S"
          iconBackground={theme.palette.neutral[800]}
          iconColor={theme.colors.textSecondary}
          title="Storage cache"
          subtitle="AsyncStorage — favourites only, ~1KB used"
        />
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
  dashboardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  healthyBadge: {
    backgroundColor: theme.palette.secondary[900],
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.radius.pill,
  },
  healthyText: {
    color: theme.colors.positive,
    fontSize: 11,
    fontWeight: "700",
  },
  gaugeWrap: {
    alignItems: "center",
    marginTop: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
  },
  metricBlock: {},
  metricValue: {
    color: theme.colors.textPrimary,
    fontSize: 28,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
  metricUnit: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    marginTop: -2,
  },
  metricLabel: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    marginTop: 4,
  },
  memoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.sm,
  },
  memoryValue: {
    color: theme.colors.negative,
    fontSize: 13,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
});
