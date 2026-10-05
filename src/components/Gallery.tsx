import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { maps } from '../data/karera';
import { SectionTitle } from './ui';
import { stills } from './Circuits';

const all = maps.flatMap((m) => stills.map((s) => ({ map: m.slug, name: m.name, shot: s, src: `/maps/${m.slug}/${s}.webp` })));
const spans = ['md:col-span-2 md:row-span-2', '', '', 'md:row-span-2', '', 'md:col-span-2', '', ''];

export function Gallery() {
  const [filter, setFilter] = useState<string | null>(null);
  const [open, setOpen] = useState<number | null>(null);
  const list = filter ? all.filter((x) => x.map === filter) : all.filter((_, i) => i % 2 === 0);

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(null);
      if (e.key === 'ArrowRight') setOpen((o) => (o === null ? o : (o + 1) % list.length));
      if (e.key === 'ArrowLeft') setOpen((o) => (o === null ? o : (o - 1 + list.length) % list.length));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, list.length]);

  return (
    <section id="gallery" className="relative py-16 md:py-24 px-4 md:px-6 max-w-7xl mx-auto z-10">
      <SectionTitle kicker="Photo mode · straight out of the engine" color="text-white">
        Gallery
      </SectionTitle>
      <div className="flex flex-wrap gap-2 mb-5">
        {[null, ...maps.map((m) => m.slug)].map((slug) => (
          <button
            key={slug ?? 'all'}
            onClick={() => setFilter(slug)}
            className={`px-3 py-1.5 font-hud text-xs uppercase tracking-wider border ${filter === slug ? 'bg-neon-yellow text-black border-neon-yellow' : 'border-white/20 hover:border-white/60'}`}
          >
            {slug ? maps.find((m) => m.slug === slug)!.name : 'Highlights'}
          </button>
        ))}
      </div>
      <motion.div layout className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 auto-rows-[110px] md:auto-rows-[160px] grid-flow-dense">
        <AnimatePresence>
          {list.map((item, i) => (
            <motion.button
              layout
              key={item.src}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={() => setOpen(i)}
              className={`${spans[i % spans.length]} relative overflow-hidden group border-2 border-transparent hover:border-hot-pink`}
            >
              <img src={item.src} alt={`${item.name} — ${item.shot}`} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
              <span className="absolute left-2 bottom-2 font-hud text-[10px] uppercase tracking-widest bg-black/70 px-1.5 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                {item.name}
              </span>
            </motion.button>
          ))}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {open !== null && list[open] && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[150] bg-black/95 flex items-center justify-center p-4" onClick={() => setOpen(null)}>
            <motion.img key={list[open].src} initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} src={list[open].src} alt="" className="max-w-full max-h-[85vh] border-2 border-white/20" onClick={(e) => e.stopPropagation()} />
            <div className="absolute bottom-6 font-hud uppercase tracking-widest text-sm">{list[open].name}</div>
            <button className="absolute top-4 right-4 p-2" onClick={() => setOpen(null)} aria-label="Close">
              <X className="w-8 h-8" />
            </button>
            <button className="absolute left-2 top-1/2 p-2" onClick={(e) => (e.stopPropagation(), setOpen((open - 1 + list.length) % list.length))} aria-label="Previous">
              <ChevronLeft className="w-10 h-10" />
            </button>
            <button className="absolute right-2 top-1/2 p-2" onClick={(e) => (e.stopPropagation(), setOpen((open + 1) % list.length))} aria-label="Next">
              <ChevronRight className="w-10 h-10" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
