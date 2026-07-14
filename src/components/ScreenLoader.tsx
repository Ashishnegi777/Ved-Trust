import { useEffect, useState } from 'react';
import vedTrustLogo from '../assets/images/ved_trust_logo.jpeg';

export default function ScreenLoader() {
  const [progress, setProgress] = useState(12);
  const [isLeaving, setIsLeaving] = useState(false);
  const [isMounted, setIsMounted] = useState(true);

  useEffect(() => {
    const progressTimer = window.setInterval(() => {
      setProgress((current) => Math.min(current + Math.random() * 18, 92));
    }, 180);

    const finishLoader = () => {
      setProgress(100);
      window.setTimeout(() => setIsLeaving(true), 260);
      window.setTimeout(() => setIsMounted(false), 820);
    };

    const minimumTimer = window.setTimeout(finishLoader, 1450);

    return () => {
      window.clearInterval(progressTimer);
      window.clearTimeout(minimumTimer);
    };
  }, []);

  if (!isMounted) return null;

  return (
    <div
      className={`fixed inset-0 z-[11000] flex items-center justify-center bg-background-warm text-text-charcoal transition-all duration-700 ease-[cubic-bezier(0.77,0,0.175,1)] ${
        isLeaving ? 'opacity-0 scale-[1.02] pointer-events-none' : 'opacity-100 scale-100'
      }`}
      aria-label="Loading Ved Trust"
      role="status"
    >
      <div className="absolute inset-0 pointer-events-none opacity-35">
        <div className="absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-earth/20" />
        <div className="absolute left-1/2 top-1/2 h-[340px] w-[340px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-pine-green/15" />
      </div>

      <div className="relative z-10 flex w-full max-w-sm flex-col items-center px-8 text-center">
        <div className="relative mb-7 flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-xl shadow-earth/10 ring-1 ring-earth/20">
          <div className="absolute inset-[-10px] rounded-full border border-earth/25 animate-ping" />
          <img
            src={vedTrustLogo}
            alt="Ved Trust logo"
            className="h-20 w-20 rounded-full object-cover"
          />
        </div>

        <p className="font-body text-xs font-semibold uppercase tracking-[0.32em] text-earth">
          Ved Trust
        </p>
        <h2 className="mt-3 font-heading text-4xl tracking-tight text-pine-green">
          Loading Seva
        </h2>

        <div className="mt-8 h-[2px] w-full overflow-hidden rounded-full bg-earth/15">
          <div
            className="h-full rounded-full bg-pine-green transition-[width] duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="mt-4 flex w-full items-center justify-between font-mono text-[10px] uppercase tracking-widest text-text-muted">
          <span>Preparing</span>
          <span>{Math.round(progress)}%</span>
        </div>
      </div>
    </div>
  );
}
