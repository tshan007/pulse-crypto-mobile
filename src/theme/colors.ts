import { generateScale } from "./colorScale";

// The 4 base colors straight from the design spec. This is the single
// place these hex values are written down — everything else derives from
// them via generateScale().
const BASE = {
  primary: "#0B0E14", // near-black brand tone — anchored at the dark end (950)
  secondary: "#00C57A", // brand green — anchored at its mid-tone (500)
  tertiary: "#FF3B69", // brand pink/red — anchored at its mid-tone (500)
  neutral: "#1E2633", // slate gray — anchored near the dark end (900)
} as const;

export const palette = {
  primary: generateScale(BASE.primary, 950),
  secondary: generateScale(BASE.secondary, 500),
  tertiary: generateScale(BASE.tertiary, 500),
  neutral: generateScale(BASE.neutral, 900),
};

/**
 * Semantic color tokens. Components should reach for these, not `palette`
 * directly, so that a future re-grading of the palette (e.g. darkening
 * `surface` app-wide) is a one-line change here rather than a find/replace
 * across every screen.
 */
export const colors = {
  // Surfaces
  background: palette.primary[950],
  surface: palette.neutral[900],
  surfaceRaised: palette.neutral[800],
  border: palette.neutral[700],

  // Text
  textPrimary: palette.neutral[50],
  textSecondary: palette.neutral[400],
  textMuted: palette.neutral[600],
  textInverted: palette.primary[950],

  // Brand
  brandSecondary: palette.secondary[500],
  brandTertiary: palette.tertiary[500],

  // Status (maps directly onto watchlist/detail-screen semantics:
  // positive = price up / buy pressure, negative = price down / sell
  // pressure / destructive actions)
  positive: palette.secondary[500],
  positiveMuted: palette.secondary[900],
  negative: palette.tertiary[500],
  negativeMuted: palette.tertiary[900],

  // Interactive states
  live: palette.secondary[500],
  offline: palette.neutral[500],

  // Component-level tokens for the 4 button variants in the spec
  button: {
    primary: { background: palette.neutral[300], text: palette.primary[950] },
    secondary: { background: palette.neutral[800], text: palette.neutral[50] },
    inverted: { background: palette.neutral[100], text: palette.primary[950] },
    outlined: { background: "transparent", text: palette.neutral[50], border: palette.neutral[600] },
  },
} as const;
