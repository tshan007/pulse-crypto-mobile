/** Generates a Tailwind-style color scale (50 → 950) from one base hex, mixing toward white/black from an anchor step. */

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

/** @param anchorStep Which scale step `baseHex` itself represents. */
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
