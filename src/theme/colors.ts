import { generateScale } from "./colorScale";

const BASE = {
  primary: "#0B0E14",
  secondary: "#00C57A",
  tertiary: "#FF3B69",
  neutral: "#1E2633",
} as const;

export const palette = {
  primary: generateScale(BASE.primary, 950),
  secondary: generateScale(BASE.secondary, 500),
  tertiary: generateScale(BASE.tertiary, 500),
  neutral: generateScale(BASE.neutral, 900),
};

export const colors = {
  background: palette.primary[950],
  surface: palette.neutral[900],
  surfaceRaised: palette.neutral[800],
  border: palette.neutral[700],

  textPrimary: palette.neutral[50],
  textSecondary: palette.neutral[400],
  textMuted: palette.neutral[600],
  textInverted: palette.primary[950],

  brandSecondary: palette.secondary[500],
  brandTertiary: palette.tertiary[500],

  positive: palette.secondary[500],
  positiveMuted: palette.secondary[900],
  negative: palette.tertiary[500],
  negativeMuted: palette.tertiary[900],

  live: palette.secondary[500],
  offline: palette.neutral[500],

  button: {
    primary: { background: palette.neutral[300], text: palette.primary[950] },
    secondary: { background: palette.neutral[800], text: palette.neutral[50] },
    inverted: { background: palette.neutral[100], text: palette.primary[950] },
    outlined: { background: "transparent", text: palette.neutral[50], border: palette.neutral[600] },
  },

  warning: "#f59e0b",

  screenBackground: "#09090b",
  cardBackground: "#18181b",
  divider: "#27272a",
  textStrong: "#fafafa",
  textDefault: "#d4d4d8",
  textDim: "#a1a1aa",
  textFaint: "#71717a",
  textFaintest: "#52525b",
  success: "#22c55e",
  successBright: "#4ade80",
  danger: "#ef4444",
  dangerBright: "#f87171",
  favourite: "#facc15",

  successWash: "rgba(34,197,94,0.15)",
  successOverlay: "rgba(34, 197, 94, 0.43)",
  dangerWash: "rgba(239, 68, 68, 0.26)",
  dangerOverlay: "rgba(239,68,68,0.35)",
} as const;
