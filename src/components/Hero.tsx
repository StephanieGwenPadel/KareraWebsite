import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { Banderitas, RouteSign } from './ui';
import { Countdown } from './Countdown';
import { maps } from '../data/karera';

/** Five reds light one by one, then all go out together: that is the start. */
function StartLights({ onGo }: { onGo: () => void }) {
  const [lit, setLit] = useState(0);
  const [out, setOut] = useState(false);
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      onGo();
      return;
    }
    const timers: number[] = [];
    for (let i = 1; i <= 5; i++) timers.push(window.setTimeout(() => setLit(i), 250 + i * 330));
    timers.push(window.setTimeout(() => setOut(true), 250 + 5 * 330 + 520));
    timers.push(window.setTimeout(onGo, 250 + 5 * 330 + 1150));
    return () => timers.forEach(clearTimeout);
  }, [onGo]);
  return (
    <motion.div
      exit={{ opacity: 0, y: '-100%' }}
      transition={{ duration: 0.5, ease: [0.7, 0, 0.3, 1] }}
      onClick={onGo}
      className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center cursor-pointer"
    >
      <div className="flex gap-3 md:gap-5 bg-[#0b0b0b] border-4 border-[#222] px-4 py-5 md:px-8 md:py-7">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="flex flex-col gap-2 md:gap-3">
            {[0, 1].map((row) => (
              <div
                key={row}
                className="w-10 h-10 md:w-16 md:h-16 rounded-full border-2 border-black transition-all duration-100"
                style={{
                  background: !out && lit > i ? 'radial-gradient(circle at 35% 35%, #ff6b6b, #e00000 55%, #6b0000)' : '#1d1d1d',
                  boxShadow: !out && lit > i ? '0 0 30px 8px rgba(255,0,0,0.55)' : 'inset 0 4px 10px rgba(0,0,0,0.8)',
                }}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="h-24 mt-6 flex items-center">
        <AnimatePresence>
          {out && (
            <motion.div
              initial={{ scale: 3, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="font-display italic text-7xl md:text-9xl text-neon-yellow hud-glow"
            >
              GO!
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="absolute bottom-6 font-hud text-xs text-gray-600 tracking-[0.3em] uppercase">Click to skip</div>
    </motion.div>
  );
}

export function Hero() {
  const [started, setStarted] = useState(false);
  const go = useCallback(() => setStarted(true), []);
  const { scrollY } = useScroll();
  const titleY = useTransform(scrollY, [0, 600], [0, 180]);
  const videoScale = useTransform(scrollY, [0, 800], [1.05, 1.25]);
  const fade = useTransform(scrollY, [0, 500], [1, 0]);

  return (
    <>
      <AnimatePresence>{!started && <StartLights onGo={go} />}</AnimatePresence>

      <section id="hero" className="relative h-[100svh] min-h-[560px] flex flex-col justify-center items-center px-4 overflow-hidden border-b-8 border-neon-yellow">
        <motion.video
          style={{ scale: videoScale }}
          className="absolute inset-0 w-full h-full object-cover"
          src="/video/montage.mp4"
          poster="/video/montage-poster.webp"
          autoPlay
          muted
          loop
          playsInline
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/30 to-asphalt" />
        <div className="absolute inset-0 scanlines opacity-30 pointer-events-none" />
        <Banderitas />

        <motion.div style={{ y: titleY, opacity: fade }} className="z-10 text-center flex flex-col items-center w-full max-w-7xl relative mt-10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={started ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.15 }}
            className="font-hud text-xs md:text-sm tracking-[0.5em] uppercase text-sun mb-3"
          >
            A Philippine kart racer
          </motion.div>
          <motion.h1
            initial={{ x: '-120vw', skewX: -30 }}
            animate={started ? { x: 0, skewX: -8 } : {}}
            transition={{ type: 'spring', stiffness: 120, damping: 14 }}
            className="font-display text-[19vw] md:text-[15vw] italic leading-[0.85] tracking-tight uppercase glitch-hover"
          >
            <span className="inline-block px-[0.14em] py-[0.04em] text-transparent bg-clip-text bg-gradient-to-br from-neon-yellow via-white to-electric-blue drop-shadow-[0_8px_0_rgba(0,0,0,0.6)]">Karera</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={started ? { opacity: 1 } : {}}
            transition={{ delay: 0.35 }}
            className="text-lg md:text-2xl font-hud font-bold uppercase text-white mt-4 max-w-3xl"
          >
            Seven real Filipino machines. Seven real places. One lap at a time.
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={started ? { opacity: 1 } : {}}
            transition={{ delay: 0.45 }}
            className="text-sm md:text-base text-gray-300 mt-3 max-w-2xl px-4"
          >
            Race a kalesa through Vigan's cobbles, a motorela round Plaza Divisoria, a jeepney down Rizal Avenue, a habal-habal over a Bukidnon pass — every one with its own gearbox, whip, pedals or battery.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={started ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.55 }}
            className="mt-8 flex flex-wrap justify-center items-center gap-4"
          >
            <RouteSign href="#garage" label="Garage" via="Via 7 vehicles" tone="sun" />
            <RouteSign href="#streets" label="Races" via={`Via ${maps.length} circuits`} tone="night" />
            <RouteSign href="#download" label="Download" via="Coming Oct 26" tone="night" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={started ? { opacity: 1 } : {}}
            transition={{ delay: 0.7 }}
            className="mt-5"
          >
            <Countdown compact />
          </motion.div>
        </motion.div>

        <motion.div animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 1.6 }} className="absolute bottom-6 z-10 flex flex-col items-center [@media(max-height:760px)]:hidden">
          <span className="font-hud text-[10px] tracking-[0.4em] text-gray-300 uppercase mb-1">Scroll to race</span>
          <ChevronDown className="w-8 h-8 text-electric-blue" />
        </motion.div>
      </section>
    </>
  );
}
