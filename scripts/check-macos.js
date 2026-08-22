if (process.platform !== "darwin") {
  console.error(
    "\niOS builds require macOS (Xcode + CocoaPods) and can't run on this platform.\n" +
      "Use EAS Build for a cloud iOS build instead: npx eas build --platform ios\n"
  );
  process.exit(1);
}
