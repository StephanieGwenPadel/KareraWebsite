import { useMemo } from 'react';
import { motion, useTransform, type MotionValue } from 'framer-motion';

/** Cumulative-distance sampler over a closed plan polyline, so a dot moves at constant speed. */
export function usePlan(plan: number[][]) {
  return useMemo(() => {
    const cum = [0];
    for (let i = 1; i <= plan.length; i++) {
      const a = plan[i - 1], b = plan[i % plan.length];
      cum.push(cum[i - 1] + Math.hypot(b[0] - a[0], b[1] - a[1]));
    }
    const total = cum[cum.length - 1];
    const d = plan.map((p, i) => `${i ? 'L' : 'M'}${p[0]} ${p[1]}`).join(' ') + ' Z';
    const at = (t: number) => {
      const target = (((t % 1) + 1) % 1) * total;
      let i = 1;
      while (i < cum.length - 1 && cum[i] < target) i++;
      const a = plan[i - 1], b = plan[i % plan.length];
      const f = (target - cum[i - 1]) / Math.max(1e-6, cum[i] - cum[i - 1]);
      return { x: a[0] + (b[0] - a[0]) * f, y: a[1] + (b[1] - a[1]) * f };
    };
    return { d, at, total };
  }, [plan]);
}

type Props = {
  plan: number[][];
  progress?: MotionValue<number>;
  stroke?: string;
  width?: number;
  className?: string;
  draw?: boolean;
  showStart?: boolean;
};

/** The circuit drawn from the game's baked centreline — the same projection the in-game minimap uses. */
export function TrackMap({ plan, progress, stroke = '#ccff00', width = 3.2, className = '', draw = true, showStart = true }: Props) {
  const { d, at } = usePlan(plan);
  const start = plan[0];
  const next = plan[2] ?? plan[1];
  const angle = (Math.atan2(next[1] - start[1], next[0] - start[0]) * 180) / Math.PI;
  return (
    <svg viewBox="-56 -56 112 112" className={className} aria-hidden>
      <path d={d} fill="none" stroke="rgba(0,0,0,0.6)" strokeWidth={width + 3} strokeLinejoin="round" />
      <path d={d} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={width + 1.4} strokeLinejoin="round" />
      <motion.path
        d={d}
        fill="none"
        stroke={stroke}
        strokeWidth={width * 0.55}
        strokeLinejoin="round"
        strokeLinecap="round"
        initial={draw ? { pathLength: 0 } : false}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.8, ease: 'easeInOut' }}
      />
      {showStart && (
        <g transform={`translate(${start[0]} ${start[1]}) rotate(${angle + 90})`}>
          <rect x={-width} y={-0.9} width={width * 2} height={1.8} fill="#fff" />
          <rect x={-width} y={-0.9} width={width} height={0.9} fill="#000" />
          <rect x={0} y={0} width={width} height={0.9} fill="#000" />
        </g>
      )}
      {progress && <Dot progress={progress} at={at} />}
    </svg>
  );
}

function Dot({ progress, at }: { progress: MotionValue<number>; at: (t: number) => { x: number; y: number } }) {
  const cx = useTransform(progress, (t) => at(t).x);
  const cy = useTransform(progress, (t) => at(t).y);
  return (
    <>
      <motion.circle cx={cx} cy={cy} r={4.6} fill="rgba(255,0,85,0.35)" />
      <motion.circle cx={cx} cy={cy} r={2.4} fill="#ff0055" stroke="#fff" strokeWidth={0.8} />
    </>
  );
}

/** Height along the lap — Bukidnon's 26 m climb is the one this exists for. */
export function ElevationProfile({ plan, color = '#f6c431', className = '' }: { plan: number[][]; color?: string; className?: string }) {
  // one shared vertical scale (30 m) so a flat town reads flat next to the mountain
  const max = Math.max(30, ...plan.map((p) => p[2]));
  const n = plan.length;
  const pts = plan.map((p, i) => `${(i / (n - 1)) * 100},${30 - (p[2] / max) * 26}`).join(' ');
  return (
    <svg viewBox="0 0 100 32" preserveAspectRatio="none" className={className} aria-hidden>
      <polygon points={`0,32 ${pts} 100,32`} fill={color} opacity={0.18} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth={0.8} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
