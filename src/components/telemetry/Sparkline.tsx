import React, { useMemo } from "react";
import Svg, { Polyline } from "react-native-svg";
import { theme } from "../../theme";

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
}

/** Simple line sparkline. Data source is the caller's responsibility. */
export const Sparkline = React.memo(function Sparkline({
  data,
  width = 260,
  height = 60,
  color = theme.colors.negative,
}: SparklineProps) {
  const points = useMemo(() => {
    if (data.length < 2) return "";
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    return data
      .map((v, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - ((v - min) / range) * height;
        return `${x},${y}`;
      })
      .join(" ");
  }, [data, width, height]);

  return (
    <Svg width={width} height={height}>
      <Polyline points={points} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
    </Svg>
  );
});
