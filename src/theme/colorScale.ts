/**
 * Generates a Tailwind-style color scale (50 → 950) from a single base hex
 * value, rather than hand-authoring every step. This keeps the palette
 * systematic and gives each brand color exactly one source of truth — the
 * base hex from the design spec — instead of ~10 independently-chosen hex
 * codes per color that can drift out of sync over time.
 *
 * How it works: each step is the base color mixed toward black (for steps
 * darker than the base's "anchor" position in the scale) or toward white
 * (for steps lighter than it), with mix strength increasing the further a
 * step is from the anchor.
 */

export const SCALE_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;
export type ScaleStep = (typeof SCALE_STEPS)[number];
export type ColorScale = Record<ScaleStep, string>;

interface RGB {
  r: number;
  g: number;
  b: number;
}

function hexToRgb(hex: string): RGB {
  const clean = hex.replace("#", "");
  const bigint = parseInt(clean, 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
}

function rgbToHex({ r, g, b }: RGB): string {
  const toHex = (n: number) => Math.round(Math.min(255, Math.max(0, n))).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

/** Mixes `hex` toward `target` by `t` (0 = pure hex, 1 = pure target). */
function mix(hex: string, target: RGB, t: number): string {
  const c = hexToRgb(hex);
  return rgbToHex({
    r: c.r + (target.r - c.r) * t,
    g: c.g + (target.g - c.g) * t,
    b: c.b + (target.b - c.b) * t,
  });
}

const BLACK: RGB = { r: 0, g: 0, b: 0 };
const WHITE: RGB = { r: 255, g: 255, b: 255 };

/**
 * @param baseHex     The brand color from the design spec, e.g. "#00C57A".
 * @param anchorStep  Which scale step `baseHex` itself represents. Brand
 *                    hues (secondary/tertiary) are typically anchored at
 *                    500 (their "purest" mid-tone); colors given as
 *                    near-black/near-dark base tones (primary/neutral) are
 *                    anchored near the dark end (900/950).
 * @param maxWhiteMix How far the lightest step (50) leans toward pure white.
 * @param maxBlackMix How far the darkest step (950) leans toward pure black.
 */
export function generateScale(
  baseHex: string,
  anchorStep: ScaleStep,
  maxWhiteMix = 0.94,
  maxBlackMix = 0.85
): ColorScale {
  const anchorIndex = SCALE_STEPS.indexOf(anchorStep);
  const lastIndex = SCALE_STEPS.length - 1;

  const scale = {} as ColorScale;
  SCALE_STEPS.forEach((step, i) => {
    if (i === anchorIndex) {
      scale[step] = baseHex.toUpperCase();
    } else if (i < anchorIndex) {
      // Lighter than the anchor: mix toward white.
      const t = ((anchorIndex - i) / anchorIndex) * maxWhiteMix;
      scale[step] = mix(baseHex, WHITE, t);
    } else {
      // Darker than the anchor: mix toward black.
      const t = ((i - anchorIndex) / (lastIndex - anchorIndex)) * maxBlackMix;
      scale[step] = mix(baseHex, BLACK, t);
    }
  });
  return scale;
}
