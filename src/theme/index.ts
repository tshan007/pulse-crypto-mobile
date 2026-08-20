import { colors, palette } from "./colors";
import { typography, fontFamily, fontSize, lineHeight } from "./typography";
import { spacing, radius } from "./spacing";

/**
 * Single import point for the design system: `import { theme } from
 * "../theme"`. Components should consume `theme.colors.*` (semantic
 * tokens) for anything that maps to a UI role (background, text, status),
 * and reach into `theme.palette.*` (raw graded scales) only for one-off
 * cases a semantic token doesn't cover yet.
 */
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
