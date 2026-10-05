import { useEffect, useState } from 'react';

/** Release: midnight at the start of 26 October 2026, Philippine time (UTC+8). */
export const RELEASE = new Date('2026-10-26T00:00:00+08:00');
export const RELEASE_LABEL = 'Oct 26';

function remaining(now: number) {
  const ms = Math.max(0, RELEASE.getTime() - now);
  const s = Math.floor(ms / 1000);
  return { done: ms === 0, days: Math.floor(s / 86400), hours: Math.floor(s / 3600) % 24, mins: Math.floor(s / 60) % 60, secs: s % 60 };
}

/** Ticks once a second. Shared by the hero strip and the download board. */
function useCountdown() {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);
  return remaining(now);
}

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * The countdown to launch, drawn as a timing board: four lit cells — days, hours, minutes,
 * seconds — in the HUD face. `compact` is the one-line strip under the hero's signs.
 */
export function Countdown({ compact = false }: { compact?: boolean }) {
  const t = useCountdown();
  const cells: [string, string][] = [
    [String(t.days), 'Days'],
    [pad(t.hours), 'Hrs'],
    [pad(t.mins), 'Min'],
    [pad(t.secs), 'Sec'],
  ];

  if (t.done)
    return (
      <div className="font-display italic uppercase text-3xl md:text-5xl text-neon-yellow drop-shadow-[0_0_18px_rgba(204,255,0,0.45)]">
        Out now
      </div>
    );

  if (compact)
    return (
      <div className="flex items-center gap-3 bg-black/60 border-2 border-white/15 px-4 py-2 skew-x-[-8deg]" role="timer" aria-label={`${t.days} days, ${t.hours} hours, ${t.mins} minutes until launch`}>
        <span className="font-hud text-[10px] md:text-xs tracking-[0.3em] uppercase text-gray-400 skew-x-[8deg]">Launch in</span>
        <span className="font-hud font-bold tabular-nums text-lg md:text-2xl text-neon-yellow skew-x-[8deg]">
          {t.days}d {pad(t.hours)}:{pad(t.mins)}:{pad(t.secs)}
        </span>
      </div>
    );

  return (
    <div className="flex items-stretch gap-2 md:gap-4" role="timer" aria-label={`${t.days} days, ${t.hours} hours, ${t.mins} minutes until launch`}>
      {cells.map(([value, label], i) => (
        <div key={label} className="flex items-stretch gap-2 md:gap-4">
          <div className="flex flex-col items-center justify-center bg-black/70 border-2 border-neon-yellow/60 min-w-[4.2rem] md:min-w-[7rem] px-2 md:px-4 py-2 md:py-3 skew-x-[-8deg] shadow-[0_0_24px_rgba(204,255,0,0.18)]">
            <span className="font-display italic tabular-nums text-4xl md:text-7xl leading-none text-white skew-x-[8deg]">{value}</span>
            <span className="font-hud text-[10px] md:text-xs tracking-[0.35em] uppercase text-neon-yellow mt-1 skew-x-[8deg]">{label}</span>
          </div>
          {i < cells.length - 1 && <span className="font-display text-3xl md:text-6xl text-white/30 self-center">:</span>}
        </div>
      ))}
    </div>
  );
}
