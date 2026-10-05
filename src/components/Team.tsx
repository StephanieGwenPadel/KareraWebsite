import { motion } from 'framer-motion';
import { Users } from 'lucide-react';
import { school, team } from '../data/team';
import { PhFlag, SectionTitle } from './ui';

const screws = [
  { cls: 'left-2 top-2', r: '35deg' },
  { cls: 'right-2 top-2', r: '-20deg' },
  { cls: 'left-2 bottom-4', r: '70deg' },
  { cls: 'right-2 bottom-4', r: '10deg' },
];

/** The pit crew: each member on a jeepney chrome panel. */
export function Team() {
  return (
    <section id="team" className="relative py-16 md:py-20 px-4 md:px-6 bg-asphalt-light z-10 border-t-8 border-hot-pink">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-2 mb-8 md:mb-10">
          <div className="[&>div]:mb-0">
            <SectionTitle
              kicker={
                <>
                  Pit crew <PhFlag className="w-[18px] h-[9px] opacity-90 ml-0.5" />
                </>
              }
              color="text-neon-yellow"
            >
              The Team
            </SectionTitle>
          </div>
          <div className="font-hud text-[10px] md:text-xs uppercase tracking-[0.3em] text-gray-400 md:text-right">
            {school.section} <span className="text-gray-600">·</span> {school.university}
          </div>
        </div>

        <div className="grid grid-cols-1 min-[480px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-5">
          {team.map((m, i) => {
            const lead = /leader/i.test(m.role);
            return (
              <motion.article
                key={m.email}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ delay: i * 0.07, type: 'spring', stiffness: 160, damping: 20 }}
                className="crew-card group"
                data-lead={lead}
              >
                {screws.map((s) => (
                  <span key={s.cls} className={`crew-screw ${s.cls}`} style={{ ['--r' as string]: s.r }} />
                ))}

                {/* header: the plate's line and the crew number */}
                <div className="px-6 pt-3.5 pb-2 border-b border-white/[0.07] font-hud text-[9px] uppercase tracking-[0.28em] text-center text-gray-400">
                  Karera <span className="text-neon-yellow">•</span> Pilipinas
                </div>

                {/* portrait, name and role: one block, centred in the card's body */}
                <div className="crew-weave flex-1 flex flex-col items-center justify-center px-4 pt-5 pb-7">
                  <div className="crew-ring">
                    <div className="w-24 h-24 md:w-28 md:h-28 rounded-[5px] overflow-hidden bg-gray-800 flex items-center justify-center">
                      {m.photo ? (
                        <img src={m.photo} alt={m.name} className="w-full h-full object-cover" loading="lazy" />
                      ) : (
                        <Users className="w-10 h-10 text-gray-600" />
                      )}
                    </div>
                  </div>
                  {/* two lines reserved for each, so every card's block is the same shape */}
                  <h4 className="mt-5 min-h-[2.5em] flex items-end justify-center text-center font-display italic uppercase text-base md:text-lg leading-tight">
                    {m.name}
                  </h4>
                  <p className="mt-1.5 min-h-[2.75em] text-center text-electric-blue font-semibold text-xs leading-snug">{m.role}</p>
                </div>

                {/* pinstripes */}
                <div className="crew-stripes" />
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
