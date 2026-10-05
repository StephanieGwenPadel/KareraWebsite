import { useRef } from 'react';
import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import { cast, chapters, vehicles } from '../data/karera';
import { SectionTitle } from './ui';

/** The Long Way Home: seven chapters, slowest machine first, each ending in a one-lap Duel. */
export function Story() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 70%', 'end 60%'] });
  const fill = useSpring(scrollYProgress, { stiffness: 120, damping: 25 });
  const height = useTransform(fill, (t) => `${Math.min(100, Math.max(0, t * 100))}%`);

  return (
    <section id="story" className="relative py-16 md:py-24 px-4 md:px-6 z-10 bg-gradient-to-b from-asphalt via-[#1a1030] to-asphalt">
      <div className="max-w-5xl mx-auto">
        <SectionTitle kicker="Story mode · The Long Way Home" color="text-sun">
          Win Their Machine
        </SectionTitle>
        <p className="text-gray-300 max-w-2xl -mt-4 mb-10 text-sm md:text-base">
          You start with one pedicab and a bent rim. Each chapter is three events ending in <span className="text-white font-bold">The Duel</span> — one lap, one rival, both of you in the same vehicle, no handicap and no rubber-band. Beat them and the machine is yours.
        </p>

        <div ref={ref} className="relative pl-10 md:pl-16">
          {/* the route */}
          <div className="absolute left-3 md:left-6 top-0 bottom-0 w-2 bg-white/10 rounded-full" />
          <motion.div style={{ height }} className="absolute left-3 md:left-6 top-0 w-2 bg-gradient-to-b from-sun via-hot-pink to-electric-blue rounded-full" />

          <div className="flex flex-col gap-6 md:gap-8">
            {chapters.map((c, i) => {
              const v = vehicles.find((x) => x.id === c.vehicle)!;
              const rival = cast.find((x) => x.id === c.rival)!;
              return (
                <motion.article
                  key={c.n}
                  initial={{ opacity: 0, x: i % 2 ? 60 : -60 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ type: 'spring', stiffness: 140, damping: 20 }}
                  className="relative grid grid-cols-[1fr_auto] md:grid-cols-[auto_1fr_auto] gap-4 items-center bg-black/50 border border-white/10 p-4 md:p-5 hover:border-sun/60 transition-colors"
                >
                  <div className="absolute -left-[42px] md:-left-[58px] top-1/2 -translate-y-1/2 w-7 h-7 md:w-9 md:h-9 rounded-full bg-asphalt border-4 border-sun flex items-center justify-center font-display text-xs md:text-sm">
                    {c.n}
                  </div>
                  <img src={`/vehicles/${v.id}-hero.webp`} alt={v.name} className="hidden md:block w-36 h-24 object-contain" loading="lazy" />
                  <div>
                    <div className="font-hud text-[10px] md:text-xs tracking-[0.3em] uppercase text-gray-400">
                      Chapter {c.n} · {v.name} · {c.map}
                    </div>
                    <h3 className="font-display italic uppercase text-xl md:text-3xl leading-tight">{c.title}</h3>
                    <p className="text-gray-400 text-sm mt-1">{c.sub}</p>
                  </div>
                  <div className="text-center w-20 md:w-28">
                    <img src={`/cast/${rival.id}.webp`} alt={rival.name} className="w-16 h-16 md:w-24 md:h-24 mx-auto" loading="lazy" />
                    <div className="font-display text-sm md:text-base mt-1">{rival.name}</div>
                    <div className="text-[10px] text-gray-500 leading-tight">{rival.role}</div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
