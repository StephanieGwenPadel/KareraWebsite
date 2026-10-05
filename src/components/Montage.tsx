import { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Volume2, Maximize2 } from 'lucide-react';
import { maps } from '../data/karera';
import { SectionTitle } from './ui';

// montage.mp4 is seven 5.5 s chase-cam runs, one per map, joined by 0.5 s slides.
const CLIP = 5;

export function Montage() {
  const video = useRef<HTMLVideoElement>(null);
  const [clip, setClip] = useState(0);
  const [time, setTime] = useState(0);
  const duration = maps.length * CLIP + 0.5;

  const seek = (i: number) => {
    if (!video.current) return;
    video.current.currentTime = i * CLIP + 0.3;
    void video.current.play();
  };

  return (
    <section id="trailer" className="relative py-16 md:py-24 px-4 md:px-6 z-10">
      <div className="max-w-6xl mx-auto">
        <SectionTitle kicker="Captured in-engine · seven circuits, one lap each" color="text-electric-blue">
          Montage
        </SectionTitle>

        <motion.div
          initial={{ opacity: 0, scale: 0.94, rotate: -1 }}
          whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ type: 'spring', stiffness: 120, damping: 18 }}
          className="relative aspect-video bg-black border-4 border-hot-pink shadow-[0_0_60px_rgba(255,0,85,0.25)] overflow-hidden"
        >
          <video
            ref={video}
            src="/video/montage.mp4"
            poster="/video/montage-poster.webp"
            className="w-full h-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            onTimeUpdate={(e) => {
              const t = e.currentTarget.currentTime;
              setTime(t);
              setClip(Math.min(maps.length - 1, Math.floor(t / CLIP)));
            }}
          />
          {/* broadcast graphics */}
          <div className="absolute top-3 left-3 flex items-center gap-2 font-hud text-xs">
            <span className="px-2 py-0.5 bg-flag-red text-white font-bold tracking-widest animate-pulse">● LIVE</span>
            <span className="px-2 py-0.5 bg-black/70 text-white tracking-widest">IN-ENGINE · UNITY 6</span>
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={clip}
              initial={{ x: -40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 40, opacity: 0 }}
              className="absolute left-3 md:left-6 bottom-8 md:bottom-12 flex items-stretch skew-x-[-12deg]"
            >
              <div className="bg-neon-yellow text-black font-display text-xl md:text-3xl px-3 flex items-center skew-x-[12deg]">{maps[clip].index}</div>
              <div className="bg-black/85 px-4 py-1.5 md:py-2 skew-x-[12deg]">
                <div className="font-display italic uppercase text-lg md:text-2xl leading-none">{maps[clip].name}</div>
                <div className="font-hud text-[10px] md:text-xs text-gray-400 uppercase tracking-widest mt-1">
                  {maps[clip].difficulty} · {maps[clip].lap} m · {maps[clip].surface}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
          <div className="absolute bottom-0 inset-x-0 h-1.5 bg-white/10">
            <div className="h-full bg-hot-pink" style={{ width: `${(time / duration) * 100}%` }} />
          </div>
          <div className="absolute top-3 right-3 flex gap-2 text-white/70">
            <Volume2 className="w-4 h-4 opacity-40" aria-label="muted" />
            <button onClick={() => video.current?.requestFullscreen()} aria-label="Full screen" className="hover:text-white">
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-5 gap-1.5 md:gap-3 mt-3">
          {maps.map((m, i) => (
            <button
              key={m.slug}
              onClick={() => seek(i)}
              className={`relative aspect-video overflow-hidden border-2 transition-colors ${clip === i ? 'border-neon-yellow' : 'border-transparent opacity-60 hover:opacity-100'}`}
            >
              <img src={`/maps/${m.slug}/action-1.webp`} alt={m.name} className="w-full h-full object-cover" loading="lazy" />
              <span className="absolute inset-x-0 bottom-0 bg-black/70 font-hud text-[9px] md:text-xs uppercase tracking-wider py-0.5 truncate">{m.name}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
