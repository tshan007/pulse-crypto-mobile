import React from "react";
import { StyleSheet, Switch, Text, View } from "react-native";
import { theme } from "../../theme";

interface ToggleRowProps {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  note?: string;
}

export const ToggleRow = React.memo(function ToggleRow({ label, value, onValueChange, note }: ToggleRowProps) {
  return (
    <View style={styles.row}>
      <View style={styles.labelColumn}>
        <Text style={styles.label}>{label}</Text>
        {note ? <Text style={styles.note}>{note}</Text> : null}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: theme.palette.neutral[700], true: theme.colors.positive }}
        thumbColor={theme.colors.textPrimary}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.palette.neutral[700],
  },
  labelColumn: {
    flex: 1,
    marginRight: 12,
  },
  label: {
    color: theme.colors.textPrimary,
    fontSize: 14,
  },
  note: {
    color: theme.colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
});
