import { useId, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Mail, X } from 'lucide-react';
import { Hero } from './components/Hero';
import { Montage } from './components/Montage';
import { DriveBy } from './components/DriveBy';
import { Showroom } from './components/Showroom';
import { GridLineup } from './components/GridLineup';
import { Circuits } from './components/Circuits';
import { Story } from './components/Story';
import { Features, Controls } from './components/Features';
import { Gallery } from './components/Gallery';
import { Team } from './components/Team';
import { RaceHud } from './components/RaceHud';
import { Countdown, RELEASE_LABEL } from './components/Countdown';
import { AndroidIcon, CheckerStrip, Marquee, RouteSign, SectionTitle } from './components/ui';
import { maps, vehicles } from './data/karera';
import { school, socials, team } from './data/team';

type IconProps = { className?: string };
const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

const FacebookIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...stroke}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const InstagramIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...stroke}>
    <rect x="2" y="2" width="20" height="20" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const TikTokIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...stroke}>
    <path d="M9 12a4 4 0 1 0 4 4V2c.6 3 2.6 5 6 5.5" />
  </svg>
);

/** A chequered flag waving on its pole: the lucide flag outline, filled with a 2x2 checker. */
const ChequeredFlag = ({ className = '' }: { className?: string }) => {
  const id = useId().replace(/:/g, '');
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <defs>
        <pattern id={`chk-${id}`} width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="skewY(-8)">
          <rect width="4" height="4" fill="#fff" />
          <rect width="2" height="2" fill="#000" />
          <rect x="2" y="2" width="2" height="2" fill="#000" />
        </pattern>
      </defs>
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" fill={`url(#chk-${id})`} stroke="#fff" strokeWidth="1.5" strokeLinejoin="round" />
      <line x1="4" y1="22" x2="4" y2="15" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
};

const FloatingNav = () => {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { name: 'Start', href: '#hero' },
    { name: 'Montage', href: '#trailer' },
    { name: 'Overview', href: '#overview' },
    { name: 'Garage', href: '#garage' },
    { name: 'The Grid', href: '#grid' },
    { name: 'Circuits', href: '#streets' },
    { name: 'Story', href: '#story' },
    { name: 'Mechanics', href: '#features' },
    { name: 'Controls', href: '#how-to-play' },
    { name: 'Gallery', href: '#gallery' },
    { name: 'Team', href: '#team' },
    { name: 'Download', href: '#download' },
  ];

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[90]"
          />
        )}
      </AnimatePresence>

      <div className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-[100] flex flex-col items-end gap-4">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              className="flex flex-col gap-2 items-end mb-2"
            >
              {menuItems.map((item, i) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: (menuItems.length - 1 - i) * 0.04 }}
                >
                  <a href={item.href} onClick={() => setIsOpen(false)} className="plate">
                    <span className="plate-country">Pilipinas</span>
                    <span className="plate-text">
                      <span className="plate-num">{String(i + 1).padStart(2, '0')}</span>
                      {item.name}
                    </span>
                  </a>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? 'Close menu' : 'Open menu'}
          className="pointer-events-auto w-16 h-16 rounded-full bg-black border-2 border-white flex items-center justify-center text-white shadow-[0_0_18px_rgba(255,255,255,0.35)] hover:scale-110 hover:shadow-[0_0_26px_rgba(255,255,255,0.6)] transition-all z-50 group"
        >
          {isOpen ? <X className="w-8 h-8" /> : <ChequeredFlag className="w-9 h-9 origin-bottom-left group-hover:animate-[wave_0.6s_ease-in-out_infinite]" />}
        </button>
      </div>
    </>
  );
};

const Overview = () => (
  <section id="overview" className="relative py-16 md:py-24 px-4 md:px-12 bg-asphalt-light border-y-4 border-neon-yellow z-10 overflow-hidden">
    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-12 items-center">
      <div>
        <SectionTitle kicker="Overview">What is Karera?</SectionTitle>
        <div className="space-y-4 text-base md:text-lg text-gray-300">
          <p>
            <strong className="text-neon-yellow">The idea:</strong> a Mario Kart-style racer where the karts are the vehicles the Philippines actually runs on — from the Spanish-era kalesa to the battery e-bike of the 2020s.
          </p>
          <p>
            <strong className="text-hot-pink">Built from research:</strong> every machine, street and sky is modelled from real places — Vigan's <em>bahay na bato</em>, Plaza Divisoria in Cagayan de Oro, the university gate in Bustos, the switchbacks of Bukidnon.
          </p>
          <p>
            <strong className="text-electric-blue">Why it plays differently:</strong> four drivetrains that feel nothing alike. Lean on a sidecar, whip a tiring horse, keep a pedicab in its cadence band, short-shift a diesel jeepney, ride a battery down to empty.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-3 mt-8">
          {[
            [vehicles.length, 'vehicles'],
            [maps.length, 'circuits'],
            ['7', 'story chapters'],
          ].map(([n, l]) => (
            <div key={l} className="bg-black/50 p-3 text-center border-b-4 border-hot-pink">
              <div className="font-display text-4xl text-white">{n}</div>
              <div className="font-hud text-[10px] md:text-xs uppercase tracking-widest text-gray-400">{l}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="relative h-[320px] md:h-[440px]">
        {[
          { id: 'jeepney', cls: 'left-0 top-0 w-[70%] z-10', r: -4, d: 0 },
          { id: 'kalesa', cls: 'right-0 top-[18%] w-[55%] z-20', r: 3, d: 0.1 },
          { id: 'habalhabal-threeup', cls: 'left-[8%] bottom-0 w-[48%] z-30', r: -2, d: 0.2 },
          { id: 'traysikel', cls: 'right-[4%] bottom-[2%] w-[42%] z-40', r: 4, d: 0.3 },
        ].map((x) => (
          <motion.img
            key={x.id}
            src={`/vehicles/${x.id}-hero.webp`}
            alt=""
            initial={{ opacity: 0, x: 120, rotate: 0 }}
            whileInView={{ opacity: 1, x: 0, rotate: x.r }}
            viewport={{ once: true }}
            transition={{ delay: x.d, type: 'spring', stiffness: 120, damping: 16 }}
            className={`absolute ${x.cls} drop-shadow-[0_20px_20px_rgba(0,0,0,0.6)]`}
          />
        ))}
      </div>
    </div>
  </section>
);

export default function App() {
  return (
    <div className="min-h-screen bg-asphalt text-white overflow-x-hidden selection:bg-hot-pink selection:text-white">
      <FloatingNav />
      <RaceHud />

      <Hero />
      <Marquee text="7 MACHINES • 7 CIRCUITS • NO RUBBER-BAND" />
      <Montage />
      <DriveBy vehicle="jeepney" caption="King of the road" tone="#ff0055" />
      <Overview />
      <Showroom />
      <DriveBy vehicle="kalesa" caption="Five whips" reverse tone="#f6c431" />
      <GridLineup />
      <Marquee text="MASTER THE DRIFT • CONQUER THE ROAD" reverse tone="pink" />
      <Circuits />
      <DriveBy vehicle="habalhabal-threeup" caption="Three-up" tone="#00f0ff" />
      <Story />
      <Features />
      <Controls />
      <DriveBy vehicle="keso" caption="Quickest away" reverse tone="#ccff00" />
      <Gallery />
      <Team />

      {/* Final CTA */}
      <section id="download" className="relative py-24 md:py-32 px-6 text-center z-10 flex flex-col items-center justify-center overflow-hidden">
        <CheckerStrip className="absolute top-0 left-0" />
        <video src="/video/bukidnon.mp4" autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
        <motion.div initial={{ scale: 0.9, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} className="relative z-10 flex flex-col items-center">
          <h2 className="font-display text-5xl md:text-7xl lg:text-[7rem] italic uppercase leading-none px-[0.15em] py-[0.05em] text-transparent bg-clip-text bg-gradient-to-r from-neon-yellow via-white to-hot-pink glitch-hover mb-4 md:mb-6">
            Ready To Karera?
          </h2>
          <p className="text-lg md:text-3xl font-hud font-bold uppercase text-gray-300 mb-8 md:mb-10">Your ride. Your road. Your race.</p>
          <div className="font-hud text-xs md:text-sm tracking-[0.4em] uppercase text-gray-400 mb-3">Lights out on October 26</div>
          <div className="mb-8 md:mb-12">
            <Countdown />
          </div>
          {/* No build is published yet: the sign says when, and goes nowhere until then. */}
          <RouteSign
            size="lg"
            tone="sun"
            label="Coming Soon"
            via={`Download · ${RELEASE_LABEL}`}
            icon={<Download className="w-7 h-7 md:w-8 md:h-8" strokeWidth={2.5} />}
            className="cursor-not-allowed"
            aria-label={`Download coming soon, ${RELEASE_LABEL}`}
          />
          <div className="mt-5 flex items-center gap-2 font-hud text-xs md:text-sm uppercase tracking-[0.2em] text-[#3ddc84]">
            <AndroidIcon className="w-5 h-5" />
            Android only · phones and tablets
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative bg-black pt-14 pb-28 md:pt-20 md:pb-28 overflow-hidden border-t-8 border-electric-blue">
        <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 md:gap-8">
            <div className="flex flex-col items-center md:items-start gap-3">
              <h2 className="font-display text-4xl md:text-6xl italic tracking-tighter uppercase text-white/20 select-none flex items-center gap-4">
                <img src="/images/Karera_Icon.png" alt="" className="w-12 h-12 md:w-16 md:h-16 opacity-20" />
                Karera
              </h2>
              <div className="flex items-stretch gap-3 text-center md:text-left">
                <span className="w-1 bg-sun shrink-0 hidden md:block" />
                <div>
                  <div className="font-display italic uppercase text-sm md:text-base text-white">{school.university}</div>
                  <div className="font-hud text-[11px] md:text-xs tracking-[0.3em] uppercase text-sun mt-0.5">{school.section}</div>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-center md:items-end gap-3">
              <div className="font-hud text-[10px] md:text-xs tracking-[0.35em] uppercase text-gray-500">Follow the race</div>
              <div className="flex gap-3">
                {[
                  { href: socials.facebook, label: 'Facebook', Icon: FacebookIcon, hover: 'hover:bg-[#1877f2] hover:border-[#1877f2]' },
                  { href: socials.instagram, label: 'Instagram', Icon: InstagramIcon, hover: 'hover:bg-gradient-to-tr hover:from-[#feda75] hover:via-[#d62976] hover:to-[#4f5bd5] hover:border-[#d62976]' },
                  { href: socials.tiktok, label: 'TikTok', Icon: TikTokIcon, hover: 'hover:bg-white hover:text-black hover:border-white' },
                ].map(({ href, label, Icon, hover }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    title={label}
                    className={`w-12 h-12 flex items-center justify-center border-2 border-white/20 text-gray-300 hover:text-white skew-x-[-10deg] transition-colors ${hover}`}
                  >
                    <Icon className="w-6 h-6 skew-x-[10deg]" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-10 md:mt-12 pt-8 border-t border-white/10">
            <div className="font-hud text-[10px] md:text-xs tracking-[0.35em] uppercase text-gray-500 mb-4 text-center md:text-left">Pit crew · contact</div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {team.map((m) => (
                <li key={m.email} className="bg-white/[0.03] border-l-4 border-hot-pink px-3 py-2.5 min-w-0">
                  <div className="flex items-baseline gap-2 min-h-[2.5em]">
                    <span className="font-display italic uppercase text-sm md:text-base leading-tight">{m.name}</span>
                  </div>
                  <div className="text-[11px] text-electric-blue font-bold leading-snug mt-1">{m.role}</div>
                  <a href={`mailto:${m.email}`} className="mt-1.5 flex items-start gap-1.5 text-xs text-gray-400 hover:text-neon-yellow transition-colors min-w-0">
                    <Mail className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span className="[overflow-wrap:anywhere]">{m.email.split("@")[0]}<wbr />@{m.email.split("@")[1]}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <p className="text-gray-500 font-bold mt-10 text-xs md:text-sm text-center">&copy; 2026 Karera Game Studio. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
