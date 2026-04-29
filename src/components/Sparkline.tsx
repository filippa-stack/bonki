interface SparklineProps {
  data: { date: string; count: number }[];
  height?: number;
  color?: string;
}

export function Sparkline({ data, height = 40, color = 'currentColor' }: SparklineProps) {
  if (!data.length) return <div style={{ height }} />;
  const width = Math.max(60, data.length * 6);
  const max = Math.max(1, ...data.map(d => d.count));
  const stepX = data.length > 1 ? width / (data.length - 1) : width;
  const points = data.map((d, i) => {
    const x = i * stepX;
    const y = height - (d.count / max) * (height - 4) - 2;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  const areaPoints = `0,${height} ${points} ${width},${height}`;
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      width="100%"
      height={height}
      style={{ color, display: 'block' }}
      aria-hidden="true"
    >
      <polygon points={areaPoints} fill={color} fillOpacity={0.12} />
      <polyline points={points} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
