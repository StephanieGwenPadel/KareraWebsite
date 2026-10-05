import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useSpring, useTransform, useVelocity } from 'framer-motion';
import { maps } from '../data/karera';
import { TrackMap } from './TrackMap';
import { formatLap } from './ui';

/** The page is one lap of San Isidro: 903 m, and a good lap is about this long. */
const LAP_SECONDS = 83.456;
const LAP_METRES = maps[0].lap;

export const sectors = [
  { id: 'trailer', name: 'Montage' },
  { id: 'garage', name: 'Garage' },
  { id: 'grid', name: 'The Grid' },
  { id: 'streets', name: 'Circuits' },
  { id: 'story', name: 'Story' },
  { id: 'features', name: 'Features' },
  { id: 'how-to-play', name: 'Controls' },
  { id: 'gallery', name: 'Photo Mode' },
  { id: 'team', name: 'Team' },
];

/**
 * A race HUD that reads the scroll: lap timer, speedometer from scroll velocity, distance,
 * a minimap of Map 1 with you on it, and a split every time you cross into a new section.
 */
export function RaceHud() {
  const { scrollYProgress, scrollY } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 200, damping: 30 });
  const velocity = useVelocity(scrollY);
  const speed = useSpring(useTransform(velocity, (v) => Math.min(120, Math.abs(v) / 28)), { stiffness: 90, damping: 18 });
  const [lapTime, setLapTime] = useState('0:00.000');
  const [kmh, setKmh] = useState(0);
  const [metres, setMetres] = useState(0);
  const [visible, setVisible] = useState(false);
  const [split, setSplit] = useState<{ n: number; name: string; time: string } | null>(null);
  const [finished, setFinished] = useState(false);

  useMotionValueEvent(progress, 'change', (t) => {
    setLapTime(formatLap(Math.max(0, t) * LAP_SECONDS));
    setMetres(Math.round(Math.max(0, t) * LAP_METRES));
  });
  useMotionValueEvent(speed, 'change', (s) => setKmh(Math.round(s)));
  useMotionValueEvent(scrollY, 'change', (y) => setVisible(y > window.innerHeight * 0.6));
  useMotionValueEvent(scrollYProgress, 'change', (t) => setFinished(t > 0.985));

  useEffect(() => {
    const seen = new Set<string>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting || seen.has(e.target.id)) continue;
          seen.add(e.target.id);
          const n = sectors.findIndex((s) => s.id === e.target.id);
          const max = document.documentElement.scrollHeight - window.innerHeight;
          const t = max > 0 ? window.scrollY / max : 0;
          setSplit({ n: n + 1, name: sectors[n].name, time: formatLap(t * LAP_SECONDS) });
        }
      },
      { rootMargin: '-45% 0px -45% 0px' },
    );
    for (const s of sectors) {
      const el = document.getElementById(s.id);
      if (el) io.observe(el);
    }
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!split) return;
    const id = setTimeout(() => setSplit(null), 2600);
    return () => clearTimeout(id);
  }, [split]);

  // the speedometer needle sweeps 240 degrees over 0..120
  const needle = -120 + (kmh / 120) * 240;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pointer-events-none fixed inset-0 z-[80]">
          {/* top: lap timer and splits */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 flex flex-col items-center">
            <div className="flex items-stretch bg-black/75 backdrop-blur border border-white/15 skew-x-[-12deg] whitespace-nowrap">
              <div className="px-3 py-1 bg-neon-yellow text-black font-hud font-bold text-xs flex items-center skew-x-[12deg]">LAP 1/1</div>
              <div className="px-4 py-1 font-hud font-bold text-lg md:text-xl tabular-nums text-white skew-x-[12deg]">{lapTime}</div>
              <div className="px-3 py-1 font-hud text-xs flex items-center text-gray-400 skew-x-[12deg] tabular-nums">{metres} m</div>
            </div>
            <AnimatePresence>
              {split && (
                <motion.div
                  key={split.n}
                  initial={{ opacity: 0, y: -10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="mt-2 flex items-stretch font-hud text-xs md:text-sm skew-x-[-12deg]"
                >
                  <div className="px-2 py-1 bg-hot-pink text-white font-bold skew-x-[12deg]">S{split.n}</div>
                  <div className="px-3 py-1 bg-black/80 text-white uppercase tracking-wider skew-x-[12deg]">{split.name}</div>
                  <div className="px-3 py-1 bg-[#1f8f3a] text-white font-bold tabular-nums skew-x-[12deg]">{split.time}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* top-left: position */}
          <div className="absolute top-3 left-3 font-display italic leading-none hidden sm:block">
            <span className="text-5xl text-white drop-shadow-[0_3px_0_#ff0055]">{finished ? '1' : Math.max(1, 5 - Math.floor(scrollYProgress.get() * 5))}</span>
            <span className="text-xl text-gray-300">/5</span>
          </div>

          {/* top-right: minimap with you on it */}
          <div className="absolute top-3 right-3 w-20 h-20 md:w-28 md:h-28 bg-black/60 backdrop-blur rounded-full border border-white/15 p-2 hidden sm:block">
            <TrackMap plan={maps[0].plan} progress={progress} draw={false} width={4} stroke="#f6c431" />
          </div>

          {/* beside it: speedometer */}
          <div className="absolute top-3 right-3 sm:right-24 md:right-32 w-20 h-20 md:w-28 md:h-28">
            <svg viewBox="-50 -50 100 100" className="w-full h-full">
              <circle r="46" fill="rgba(0,0,0,0.65)" stroke="rgba(255,255,255,0.15)" />
              {Array.from({ length: 13 }, (_, i) => {
                const a = ((-120 + i * 20 - 90) * Math.PI) / 180;
                return <line key={i} x1={Math.cos(a) * 36} y1={Math.sin(a) * 36} x2={Math.cos(a) * 42} y2={Math.sin(a) * 42} stroke={i >= 10 ? '#ff0055' : '#fff'} strokeWidth={i % 2 ? 1 : 2} />;
              })}
              <g style={{ transform: `rotate(${needle}deg)`, transition: 'transform 80ms linear' }}>
                <line x1={0} y1={6} x2={0} y2={-38} stroke="#ccff00" strokeWidth={2.5} strokeLinecap="round" />
              </g>
              <circle r="4" fill="#ccff00" />
              <text y="24" textAnchor="middle" className="font-hud" fontSize="15" fontWeight="700" fill="#fff">
                {kmh}
              </text>
              <text y="35" textAnchor="middle" className="font-hud" fontSize="6.5" fill="#9ca3af">
                KM/H
              </text>
            </svg>
          </div>

          <AnimatePresence>
            {finished && (
              <motion.div
                initial={{ opacity: 0, scale: 1.4 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="absolute top-20 left-1/2 -translate-x-1/2 bg-black/85 border-2 border-sun px-6 py-3 text-center"
              >
                <div className="checker h-3 w-full mb-2" />
                <div className="font-display italic uppercase text-2xl text-sun">Finish · P1</div>
                <div className="font-hud text-white tabular-nums">{formatLap(LAP_SECONDS)}</div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
