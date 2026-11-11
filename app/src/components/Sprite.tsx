import { useEffect, useRef } from 'react';

interface Props {
  w: number;  // kích thước khung vẽ (điểm ảnh art)
  h: number;
  scale?: number; // phóng to bao nhiêu lần (pixel art nên là số nguyên)
  draw: (g: CanvasRenderingContext2D) => void;
  className?: string;
}

/** Canvas nhỏ vẽ sprite pixel — luôn render nét căng (image-rendering: pixelated) */
export default function Sprite({ w, h, scale = 3, draw, className }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const g = cv.getContext('2d');
    if (!g) return;
    g.imageSmoothingEnabled = false;
    g.clearRect(0, 0, w, h);
    draw(g);
  }, [draw, w, h]);
  return (
    <canvas
      ref={ref}
      width={w}
      height={h}
      className={className}
      style={{ imageRendering: 'pixelated', width: w * scale, height: h * scale }}
    />
  );
}
