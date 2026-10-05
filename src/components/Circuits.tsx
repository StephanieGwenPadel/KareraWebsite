import { useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Mountain, Ruler, Route, Sun, Layers, BookOpen } from 'lucide-react';
import { maps, vehicles } from '../data/karera';
import { Banderitas, SectionTitle } from './ui';
import { ElevationProfile, TrackMap } from './TrackMap';

export const stills = ['grid', 'pack', 'action-1', 'action-2', 'action-3', 'action-4', 'aerial', 'aerial-2'] as const;
const diffColour: Record<string, string> = { Easy: '#22c55e', Medium: '#f6c431', Hard: '#f97316', Hardest: '#ef4444', Mountain: '#a78bfa', Fast: '#38bdf8', Finale: '#ff2d95' };

export function Circuits() {
  const [sel, setSel] = useState(0);
  const [shot, setShot] = useState<string>('grid');
  const [hover, setHover] = useState(false);
  const m = maps[sel];
  const hero = vehicles.find((v) => v.id === m.hero)!;

  return (
    <section id="streets" className="relative py-16 md:py-24 overflow-hidden z-10 border-y-4 border-neon-yellow bg-black">
      <Banderitas />
      <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10 pt-8">
        <SectionTitle kicker="Track select · drawn from each map's baked centreline" color="text-white">
          Seven Circuits
        </SectionTitle>

        {/* the track select row */}
        <div className="grid grid-cols-4 md:grid-cols-7 gap-2 md:gap-3">
          {maps.map((map, i) => (
            <motion.button
              key={map.slug}
              onClick={() => {
                setSel(i);
                setShot('grid');
              }}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, type: 'spring', stiffness: 200, damping: 20 }}
              className={`relative text-left p-2 md:p-3 border-2 transition-all ${
                sel === i ? 'border-neon-yellow bg-neon-yellow/10 -translate-y-1 shadow-[0_0_30px_rgba(204,255,0,0.25)]' : 'border-white/10 bg-white/[0.03] hover:border-white/40'
              }`}
            >
              <div className="font-hud text-[9px] md:text-xs tracking-widest text-gray-400">MAP {map.index}</div>
              <TrackMap plan={map.plan} stroke={sel === i ? '#ccff00' : '#ffffff'} className="w-full aspect-square my-1" showStart={sel === i} />
              <div className="font-display italic uppercase text-[11px] sm:text-sm md:text-base leading-tight min-h-[2.5em] line-clamp-2 break-words">{map.name}</div>
              <div className="font-hud text-[9px] md:text-xs font-bold uppercase tracking-wider" style={{ color: diffColour[map.difficulty] }}>
                {map.difficulty}
              </div>
            </motion.button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={m.slug}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="mt-6 md:mt-8 grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-6 lg:items-stretch"
          >
            {/* the viewer: stills, and the map's own chase-cam clip on hover */}
            <div className="flex flex-col">
              <div
                className="relative aspect-video lg:aspect-auto lg:flex-1 lg:min-h-[320px] bg-asphalt-light overflow-hidden border-2 border-white/10 group"
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
              >
                <AnimatePresence mode="popLayout">
                  <motion.img
                    key={shot}
                    src={`/maps/${m.slug}/${shot}.webp`}
                    alt={`${m.name} — ${shot}`}
                    initial={{ opacity: 0, scale: 1.08, x: 40 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.45 }}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </AnimatePresence>
                {hover && <video src={`/video/${m.slug}.mp4`} autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover" />}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
                <div className="absolute left-3 bottom-3 font-hud text-xs uppercase tracking-widest text-white/80">
                  {hover ? '▶ Chase cam' : 'Hover to ride along'}
                </div>
                <div className="absolute right-3 top-3 w-20 md:w-28 bg-black/60 backdrop-blur rounded-full p-1.5">
                  <TrackMap plan={m.plan} draw={false} width={4} stroke="#f6c431" />
                </div>
              </div>
              <div className="grid grid-cols-8 gap-1 md:gap-2 mt-2 shrink-0">
                {stills.map((s) => (
                  <button key={s} onClick={() => setShot(s)} className={`aspect-video overflow-hidden border-2 ${shot === s ? 'border-neon-yellow' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                    <img src={`/maps/${m.slug}/${s}.webp`} alt="" className="w-full h-full object-cover" loading="lazy" />
                  </button>
                ))}
              </div>
            </div>

            {/* the race card */}
            <div className="bg-asphalt-light border-l-4 border-neon-yellow p-5 md:p-6 flex flex-col gap-3.5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-hud text-xs tracking-[0.3em] text-gray-400 uppercase">Map {m.index}</div>
                  <h3 className="font-display italic uppercase text-3xl md:text-5xl leading-none text-neon-yellow">{m.name}</h3>
                </div>
                <span className="px-3 py-1 font-hud font-bold text-xs uppercase tracking-widest text-black" style={{ background: diffColour[m.difficulty] }}>
                  {m.difficulty}
                </span>
              </div>
              <p className="text-gray-300 text-sm leading-snug">{m.flavour}</p>
              <div className="grid grid-cols-2 gap-2 font-hud text-sm">
                <Fact icon={<Route className="w-4 h-4" />} label="Lap" value={`${m.lap} m`} />
                <Fact icon={<Ruler className="w-4 h-4" />} label="Road width" value={`${m.width} m`} />
                <Fact icon={<Layers className="w-4 h-4" />} label="Surface" value={m.surface} />
                <Fact icon={<Sun className="w-4 h-4" />} label="Sky" value={m.sky} />
                <Fact icon={<Mountain className="w-4 h-4" />} label="Height range" value={`${m.climb} m`} />
                <Fact icon={<BookOpen className="w-4 h-4" />} label="Story" value={m.chapter} />
              </div>
              <div>
                <div className="font-hud text-[10px] tracking-[0.3em] uppercase text-gray-500 mb-1">Elevation over one lap</div>
                <ElevationProfile plan={m.plan} className="w-full h-14 bg-black/30" />
              </div>
              <div className="flex items-center gap-3 mt-auto bg-black/40 p-2">
                <img src={`/vehicles/${hero.id}-hero.webp`} alt="" className="w-20 h-14 object-contain" />
                <div className="text-xs text-gray-400">
                  Home ground of the <span className="text-white font-bold">{hero.name}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        <motion.img
          src="/maps/montage-collage.webp"
          alt="Montage of the seven circuits"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="w-full mt-10 border-4 border-white/10"
          loading="lazy"
        />
      </div>
    </section>
  );
}

function Fact({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="bg-black/40 px-3 py-2">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-gray-500">
        {icon}
        {label}
      </div>
      <div className="text-white font-bold">{value}</div>
    </div>
  );
}
