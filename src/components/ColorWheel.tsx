import { useRef, useState, useCallback, useEffect } from 'react';

interface ColorWheelProps {
  size?: number;
  currentColor?: string;
  onColorChange: (color: string) => void;
}

export default function ColorWheel({ 
  size = 200, 
  currentColor,
  onColorChange 
}: ColorWheelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<{ x: number; y: number } | null>(null);
  const [lightness, setLightness] = useState(50);

  const center = size / 2;
  const radius = (size / 2) - 10;

  // Draw the color wheel
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, size, size);

    // Draw color wheel
    for (let angle = 0; angle < 360; angle++) {
      const startAngle = (angle - 1) * Math.PI / 180;
      const endAngle = (angle + 1) * Math.PI / 180;

      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, startAngle, endAngle);
      ctx.closePath();

      // Create gradient from center (white/gray) to edge (saturated color)
      const gradient = ctx.createRadialGradient(center, center, 0, center, center, radius);
      gradient.addColorStop(0, `hsl(${angle}, 0%, ${lightness}%)`);
      gradient.addColorStop(0.5, `hsl(${angle}, 50%, ${lightness}%)`);
      gradient.addColorStop(1, `hsl(${angle}, 100%, ${lightness}%)`);

      ctx.fillStyle = gradient;
      ctx.fill();
    }

    // Draw center circle for lightness reference
    ctx.beginPath();
    ctx.arc(center, center, 15, 0, 2 * Math.PI);
    ctx.fillStyle = `hsl(0, 0%, ${lightness}%)`;
    ctx.strokeStyle = 'hsl(var(--border))';
    ctx.lineWidth = 2;
    ctx.fill();
    ctx.stroke();

    // Draw selection indicator
    if (selectedPosition) {
      ctx.beginPath();
      ctx.arc(selectedPosition.x, selectedPosition.y, 8, 0, 2 * Math.PI);
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(selectedPosition.x, selectedPosition.y, 8, 0, 2 * Math.PI);
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }, [size, center, radius, lightness, selectedPosition]);

  const getColorFromPosition = useCallback((x: number, y: number) => {
    const dx = x - center;
    const dy = y - center;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > radius) return null;

    // Calculate angle (hue)
    let angle = Math.atan2(dy, dx) * 180 / Math.PI;
    if (angle < 0) angle += 360;

    // Calculate saturation based on distance from center
    const saturation = Math.min(100, (distance / radius) * 100);

    return `hsl(${Math.round(angle)}, ${Math.round(saturation)}%, ${lightness}%)`;
  }, [center, radius, lightness]);

  const handleInteraction = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const color = getColorFromPosition(x, y);
    if (color) {
      setSelectedPosition({ x, y });
      onColorChange(color);
    }
  }, [getColorFromPosition, onColorChange]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDragging(true);
    handleInteraction(e.clientX, e.clientY);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      handleInteraction(e.clientX, e.clientY);
    }
  }, [isDragging, handleInteraction]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    setIsDragging(true);
    const touch = e.touches[0];
    handleInteraction(touch.clientX, touch.clientY);
  };

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (isDragging) {
      const touch = e.touches[0];
      handleInteraction(touch.clientX, touch.clientY);
    }
  }, [isDragging, handleInteraction]);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove]);

  return (
    <div className="flex flex-col items-center gap-3" onClick={(e) => e.stopPropagation()}>
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        className="cursor-crosshair touch-none rounded-full"
        style={{ touchAction: 'none' }}
      />
      
      {/* Lightness slider */}
      <div className="w-full px-2">
        <label className="text-xs text-muted-foreground mb-1 block">
          Ljusstyrka: {lightness}%
        </label>
        <input
          type="range"
          min="10"
          max="90"
          value={lightness}
          onChange={(e) => setLightness(Number(e.target.value))}
          onClick={(e) => e.stopPropagation()}
          className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
        />
      </div>
      
      {/* Current color preview */}
      {currentColor && (
        <div className="flex items-center gap-2 w-full px-2">
          <div 
            className="w-8 h-8 rounded-full border-2 border-border"
            style={{ backgroundColor: currentColor }}
          />
          <span className="text-xs text-muted-foreground font-mono truncate flex-1">
            {currentColor}
          </span>
        </div>
      )}
    </div>
  );
}
