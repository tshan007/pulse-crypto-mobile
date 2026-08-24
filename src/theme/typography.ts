/** Font family names for expo-font — the @expo-google-fonts packages aren't installed yet, so RN falls back to the platform default. */
export const fontFamily = {
  headline: "HankenGrotesk-Bold", // display/heading text
  headlineMedium: "HankenGrotesk-Medium",
  body: "Inter-Regular", // body copy, default UI text
  bodyMedium: "Inter-Medium",
  bodySemiBold: "Inter-SemiBold",
  label: "JetBrainsMono-Regular", // numeric/monospace: prices, tickers, timestamps
  labelMedium: "JetBrainsMono-Medium",
} as const;

/** Usage-scale font sizes actually used across screens (not the design spec's large "Aa" specimens). */
export const fontSize = {
  displayLarge: 34, // e.g. detail screen's current price
  headingLarge: 22, // screen titles
  headingSmall: 17,
  bodyLarge: 16, // row primary text
  bodyMedium: 14,
  bodySmall: 13,
  label: 12, // captions, timestamps, secondary metadata
  labelSmall: 11,
} as const;

export const lineHeight = {
  displayLarge: 40,
  headingLarge: 28,
  headingSmall: 22,
  bodyLarge: 22,
  bodyMedium: 20,
  bodySmall: 18,
  label: 16,
  labelSmall: 14,
} as const;

export const typography = {
  displayLarge: { fontFamily: fontFamily.headline, fontSize: fontSize.displayLarge, lineHeight: lineHeight.displayLarge },
  headingLarge: { fontFamily: fontFamily.headline, fontSize: fontSize.headingLarge, lineHeight: lineHeight.headingLarge },
  headingSmall: { fontFamily: fontFamily.headlineMedium, fontSize: fontSize.headingSmall, lineHeight: lineHeight.headingSmall },
  bodyLarge: { fontFamily: fontFamily.body, fontSize: fontSize.bodyLarge, lineHeight: lineHeight.bodyLarge },
  bodyMedium: { fontFamily: fontFamily.body, fontSize: fontSize.bodyMedium, lineHeight: lineHeight.bodyMedium },
  bodySmall: { fontFamily: fontFamily.body, fontSize: fontSize.bodySmall, lineHeight: lineHeight.bodySmall },
  label: { fontFamily: fontFamily.label, fontSize: fontSize.label, lineHeight: lineHeight.label },
  labelSmall: { fontFamily: fontFamily.label, fontSize: fontSize.labelSmall, lineHeight: lineHeight.labelSmall },
} as const;
