import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

export const Banderitas = () => (
  <div className="absolute top-0 left-0 w-full overflow-hidden pointer-events-none z-10 flex justify-around opacity-90 drop-shadow-[0_5px_15px_rgba(0,0,0,0.5)]">
    <div className="absolute top-0 left-0 w-full h-1 bg-white/30 -z-10"></div>
    {[...Array(16)].map((_, i) => (
      <motion.div
        key={i}
        animate={{ rotate: [-5, 5, -5] }}
        transition={{ repeat: Infinity, duration: 2 + (i % 3) * 0.5, ease: 'easeInOut' }}
        className={`w-0 h-0 border-l-[20px] md:border-l-[30px] border-l-transparent border-r-[20px] md:border-r-[30px] border-r-transparent border-t-[36px] md:border-t-[56px] ${
          ['border-t-flag-red', 'border-t-sun', 'border-t-flag-blue', 'border-t-hot-pink', 'border-t-green-500', 'border-t-capiz'][i % 6]
        } origin-top -mt-1`}
      ></motion.div>
    ))}
  </div>
);

export const Marquee = ({ text, reverse = false, tone = 'yellow' }: { text: string; reverse?: boolean; tone?: 'yellow' | 'pink' }) => (
  <div
    className={`flex overflow-hidden whitespace-nowrap font-display text-3xl md:text-4xl uppercase py-2 border-y-4 border-black -skew-y-2 origin-left w-[110%] -ml-[5%] shadow-2xl z-20 relative ${
      tone === 'yellow' ? 'bg-neon-yellow text-black' : 'bg-hot-pink text-white'
    }`}
  >
    <motion.div
      animate={{ x: reverse ? ['-50%', '0%'] : ['0%', '-50%'] }}
      transition={{ repeat: Infinity, duration: 24, ease: 'linear' }}
      className="flex shrink-0"
    >
      {[...Array(16)].map((_, i) => (
        <span key={i} className="px-4">{text} •</span>
      ))}
    </motion.div>
  </div>
);

export const SectionTitle = ({ kicker, children, color = 'text-white', compact = false }: { kicker?: ReactNode; children: ReactNode; color?: string; compact?: boolean }) => (
  <div className={compact ? 'mb-3 md:mb-4' : 'mb-8 md:mb-10'}>
    {kicker && (
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        className="font-hud text-xs md:text-sm tracking-[0.35em] uppercase text-sun mb-2 flex items-center gap-3"
      >
        <span className="inline-block w-8 h-[3px] bg-sun" />
        {kicker}
      </motion.div>
    )}
    <motion.h2
      initial={{ opacity: 0, y: 30, skewX: -12 }}
      whileInView={{ opacity: 1, y: 0, skewX: 0 }}
      viewport={{ once: true }}
      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      className={`font-display ${compact ? 'text-3xl md:text-5xl' : 'text-4xl md:text-6xl'} italic uppercase leading-none ${color} glitch-hover inline-block`}
    >
      {children}
    </motion.h2>
  </div>
);

export const CheckerStrip = ({ className = '' }: { className?: string }) => <div className={`checker h-6 w-full ${className}`} />;

export const StatBar = ({ label, value, unit, fraction, color }: { label: string; value: string | number; unit?: string; fraction: number; color: string }) => (
  <div>
    <div className="flex justify-between mb-1 font-hud font-semibold uppercase text-xs tracking-wider text-gray-400">
      <span>{label}</span>
      <span className="text-white">
        {value}
        {unit && <span className="text-gray-500 ml-1">{unit}</span>}
      </span>
    </div>
    <div className="h-2 w-full bg-white/5 overflow-hidden skew-x-[-20deg]">
      <motion.div
        className="h-full"
        style={{ background: color }}
        initial={{ width: 0 }}
        animate={{ width: `${Math.max(4, Math.min(100, fraction * 100))}%` }}
        transition={{ type: 'spring', stiffness: 120, damping: 20 }}
      />
    </div>
  </div>
);

/** mm:ss.mmm, the way the game's results table prints a lap. */
export const formatLap = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds - m * 60;
  return `${m}:${s.toFixed(3).padStart(6, '0')}`;
};

/** The Android robot's head, for "available on Android" badges. */
export function AndroidIcon({ className = '', eye = '#000' }: { className?: string; eye?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="currentColor">
      <path d="M3 19a9 9 0 0 1 18 0z" />
      <path d="M6.5 7.5l2 3M17.5 7.5l-2 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="8.5" cy="15.2" r="1.15" fill={eye} />
      <circle cx="15.5" cy="15.2" r="1.15" fill={eye} />
    </svg>
  );
}

/** A small "Available on Android" chip. */
export function AndroidBadge({ className = '' }: { className?: string }) {
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 bg-black/60 border border-[#3ddc84]/60 text-[#3ddc84] font-hud text-xs md:text-sm uppercase tracking-[0.2em] ${className}`}>
      <AndroidIcon className="w-5 h-5" />
      <span>Available on Android</span>
    </div>
  );
}

type SignTone = 'sun' | 'cream' | 'red' | 'night';
const signSize = {
  sm: 'px-4 py-2 text-base',
  md: 'min-w-[190px] md:min-w-[220px] px-8 py-3 text-2xl md:text-3xl',
  lg: 'px-9 py-3.5 text-3xl md:text-4xl',
};

/**
 * A button painted like a jeepney's windscreen route board: the destination big, an optional
 * "via" line under it. Renders a link when given `href`, otherwise a button.
 */
export function RouteSign({
  label,
  via,
  tone = 'sun',
  size = 'md',
  href,
  onClick,
  icon,
  active,
  className = '',
  ...rest
}: {
  label: ReactNode;
  via?: ReactNode;
  tone?: SignTone;
  size?: keyof typeof signSize;
  href?: string;
  onClick?: () => void;
  icon?: ReactNode;
  active?: boolean;
  className?: string;
  'aria-label'?: string;
}) {
  const body = (
    <>
      <span className="route-sign-label flex items-center gap-2">
        {label}
        {icon}
      </span>
      {via && <span className="route-sign-via">{via}</span>}
    </>
  );
  const props = { className: `route-sign ${signSize[size]} ${className}`, 'data-tone': tone, 'data-active': active || undefined, onClick, ...rest };
  return href ? (
    <a href={href} {...props}>
      {body}
    </a>
  ) : (
    <button type="button" {...props}>
      {body}
    </button>
  );
}

/** The Philippine flag, drawn small: blue over red, the white triangle, the eight-rayed sun and three stars. */
export function PhFlag({ className = '' }: { className?: string }) {
  const rays = Array.from({ length: 8 }, (_, i) => (i * Math.PI) / 4);
  return (
    <svg viewBox="0 0 60 30" className={`inline-block rounded-[2px] ring-1 ring-white/15 ${className}`} role="img" aria-label="Philippine flag">
      <rect width="60" height="15" fill="#0038a8" />
      <rect y="15" width="60" height="15" fill="#ce1126" />
      <polygon points="0,0 26,15 0,30" fill="#fff" />
      <g fill="#fcd116" stroke="#fcd116">
        <circle cx="8.7" cy="15" r="2.4" stroke="none" />
        {rays.map((a) => (
          <line key={a} x1={8.7 + Math.cos(a) * 3} y1={15 + Math.sin(a) * 3} x2={8.7 + Math.cos(a) * 5} y2={15 + Math.sin(a) * 5} strokeWidth="1.1" />
        ))}
        <circle cx="2.6" cy="3.2" r="1.1" stroke="none" />
        <circle cx="2.6" cy="26.8" r="1.1" stroke="none" />
        <circle cx="22" cy="15" r="1.1" stroke="none" />
      </g>
    </svg>
  );
}
