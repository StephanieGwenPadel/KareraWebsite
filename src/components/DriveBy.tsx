import { useRef } from 'react';
import { motion, useScroll, useSpring, useTransform, useVelocity, useMotionTemplate } from 'framer-motion';
import { vehicles } from '../data/karera';

type Props = { vehicle: string; caption?: string; reverse?: boolean; tone?: string };

/**
 * A strip of road between sections. The vehicle is tied to the scroll: it comes in from the edge,
 * brakes into the middle of the screen while you read, and pulls away as you scroll past.
 * The cut-outs are orthographic at 250 px per metre, so a jeepney really is three times a KESO.
 */
export function DriveBy({ vehicle, caption, reverse = false, tone = '#ccff00' }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const v = vehicles.find((x) => x.id === vehicle.replace('-threeup', ''))!;
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const p = useSpring(scrollYProgress, { stiffness: 140, damping: 26, mass: 0.4 });
  const dir = reverse ? -1 : 1;
  // in, brake, hold, launch: the middle third of the scroll barely moves it
  const x = useTransform(p, [0, 0.38, 0.62, 1], [`${-75 * dir}vw`, `${-4 * dir}vw`, `${4 * dir}vw`, `${95 * dir}vw`]);
  const velocity = useVelocity(p);
  const blur = useTransform(velocity, (s) => Math.min(6, Math.abs(s) * 9));
  const filter = useMotionTemplate`blur(${blur}px)`;
  const lines = useTransform(velocity, (s) => Math.min(1, Math.abs(s) * 3));
  const bob = useTransform(p, (t) => Math.sin(t * 90) * 1.5);
  const dash = useTransform(p, (t) => `${-t * 2400 * dir}px`);
  const captionX = useTransform(p, [0, 1], [`${12 * dir}%`, `${-12 * dir}%`]);
  const kmh = useTransform(velocity, (s) => `${Math.min(v.kmh, Math.round(Math.abs(s) * v.kmh * 1.6))}`);

  return (
    <div ref={ref} className="relative h-[230px] md:h-[300px] overflow-hidden z-10 bg-asphalt" aria-hidden>
      <motion.div
        style={{ x: captionX }}
        className="absolute inset-x-0 top-3 md:top-4 text-center font-display italic uppercase text-5xl md:text-8xl leading-none whitespace-nowrap select-none"
      >
        <span style={{ color: tone, opacity: 0.12 }}>{caption ?? v.name}</span>
      </motion.div>

      <motion.div style={{ ['--dash' as string]: dash }} className="road absolute inset-x-0 bottom-0 h-[110px] md:h-[130px]" />
      <motion.div style={{ opacity: lines }} className="speed-lines absolute inset-x-0 bottom-[30px] h-[120px]" />

      <motion.div style={{ x, y: bob }} className="absolute bottom-[34px] md:bottom-[44px] left-1/2 -translate-x-1/2 w-[340px] md:w-[520px]">
        <motion.img
          src={`/vehicles/${vehicle}-side.webp`}
          alt=""
          style={{ filter, scaleX: dir }}
          className="w-full drop-shadow-[0_14px_10px_rgba(0,0,0,0.6)]"
          draggable={false}
        />
      </motion.div>

      <div className="absolute left-4 md:left-8 top-4 md:top-6 font-hud">
        <div className="text-[10px] md:text-xs tracking-[0.3em] text-gray-500 uppercase">{v.english}</div>
        <div className="text-2xl md:text-4xl font-bold hud-glow" style={{ color: tone }}>
          <motion.span>{kmh}</motion.span>
          <span className="text-xs md:text-sm text-gray-400 ml-1">km/h</span>
        </div>
        <div className="text-[10px] md:text-xs text-gray-500 uppercase tracking-widest">top {v.kmh}</div>
      </div>
    </div>
  );
}
