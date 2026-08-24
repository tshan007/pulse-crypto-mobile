import { colors, palette } from "./colors";
import { typography, fontFamily, fontSize, lineHeight } from "./typography";
import { spacing, radius } from "./spacing";

/** Single import point for the design system. Prefer `theme.colors.*` (semantic) over `theme.palette.*` (raw scales). */
export const theme = {
  colors,
  palette,
  typography,
  fontFamily,
  fontSize,
  lineHeight,
  spacing,
  radius,
} as const;

export type Theme = typeof theme;

// Re-exported individually too, for call sites that only need one slice.
export { colors, palette, typography, fontFamily, fontSize, lineHeight, spacing, radius };
