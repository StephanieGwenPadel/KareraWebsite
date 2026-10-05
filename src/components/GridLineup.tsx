import { useRef } from 'react';
import { motion, useScroll, useSpring, useTransform, type MotionValue } from 'framer-motion';
import { vehicles } from '../data/karera';
import { SectionTitle } from './ui';

// Bounding-box length of each prefab in metres, measured in Unity at export.
const lengthM: Record<string, number> = { traysikel: 1.91, kalesa: 4.77, padyak: 1.76, jeepney: 5.74, habalhabal: 2.82, keso: 1.93, motorela: 3.44 };
// The side cut-outs are 6.4 m x 3.2 m, centred on the vehicle's bounds.
const IMG_M = 6.4;

/** Every vehicle rolls up to the line at true scale as you scroll — the roster as a starting grid. */
export function GridLineup() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'center center'] });
  const p = useSpring(scrollYProgress, { stiffness: 110, damping: 24 });
  const order = [...vehicles].sort((a, b) => b.kmh - a.kmh);

  return (
    <section id="grid" ref={ref} className="relative py-16 md:py-24 z-10 overflow-hidden bg-[#0d0d10]">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <SectionTitle kicker="True scale · gridded by top speed" color="text-hot-pink">
          The Grid
        </SectionTitle>
        <p className="text-gray-400 max-w-2xl -mt-4 mb-8 text-sm md:text-base">
          Every machine drawn from the game's own model at the same scale, lined up by top speed. The jeepney is fastest in a straight line; the KESO is quickest away and only fifth flat out; the padyak is a man's legs and turns inside everything.
        </p>
      </div>
      {/* --line is the start line: 72% across on a wide screen, and on a phone far enough right to
          leave a fixed column for the names so they never run into the line or the vehicles */}
      <div className="relative [--line:calc(100%-128px)] md:[--line:72%]" style={{ ['--ppm' as string]: 'clamp(22px, 5.2vw, 64px)' }}>
        {/* the start line */}
        <div className="absolute top-0 bottom-0 w-2 md:w-3 checker z-0" style={{ left: 'var(--line)' }} />
        {order.map((v, i) => (
          <Lane key={v.id} id={v.id} name={v.name} kmh={v.kmh} accent={v.accent} slot={i} progress={p} />
        ))}
      </div>
    </section>
  );
}

function Lane({ id, name, kmh, accent, slot, progress }: { id: string; name: string; kmh: number; accent: string; slot: number; progress: MotionValue<number> }) {
  const start = slot * 0.06;
  const x = useTransform(progress, [start, Math.min(1, start + 0.55)], ['-110vw', '0vw']);
  const lean = useTransform(progress, [start, start + 0.45, start + 0.55], [-4, -2, 0]);
  const len = lengthM[id];
  return (
    <div className="relative border-b border-dashed border-white/10" style={{ height: 'max(44px, calc(var(--ppm) * 1.5))' }}>
      <div className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 z-10 font-hud">
        <div className="font-display italic text-xl md:text-4xl leading-none" style={{ color: accent === '#2f6b4a' ? '#5fb07f' : accent }}>
          P{slot + 1}
        </div>
      </div>
      <motion.div
        style={{
          x,
          rotate: lean,
          width: `calc(var(--ppm) * ${IMG_M})`,
          // the vehicle's nose sits on the start line
          left: `calc(var(--line) - var(--ppm) * ${IMG_M / 2 + len / 2})`,
        }}
        className="absolute bottom-0 origin-bottom"
      >
        <img src={`/vehicles/${id}-side.webp`} alt={name} className="w-full drop-shadow-[0_8px_6px_rgba(0,0,0,0.6)]" loading="lazy" draggable={false} />
      </motion.div>
      <div className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 w-[104px] md:w-auto text-right font-hud z-10">
        <div className="font-display italic uppercase text-[13px] md:text-2xl leading-none whitespace-nowrap">{name}</div>
        <div className="text-[9px] md:text-xs text-gray-400 tabular-nums whitespace-nowrap mt-0.5">
          {kmh} km/h · {len.toFixed(1)} m
        </div>
      </div>
    </div>
  );
}
