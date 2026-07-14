import { useEffect, useRef, useState } from 'react';

const eyebrow = 'हमारा उद्देश्य · Our Mission';
const heading = 'Research, Seva & Swaraj begin here.';
const body =
  'Ved Trust brings CS/IT research into dialogue with education, healthcare, animal welfare, and environmental conservation. We build useful knowledge, practical tools, and long-term community support - one step, one seva at a time.';

function WordReveal({
  text,
  className,
  active,
  delayOffset = 0,
}: {
  text: string;
  className: string;
  active: boolean;
  delayOffset?: number;
}) {
  const words = text.split(' ');

  return (
    <span className={className} aria-label={text}>
      {words.map((word, index) => (
        <span
          key={`${word}-${index}`}
          data-mission-word="true"
          aria-hidden="true"
          className="inline-block will-change-transform"
          style={{
            opacity: active ? 1 : 0,
            transform: active ? 'translate3d(0, 0, 0)' : 'translate3d(0, 28px, 0)',
            filter: active ? 'blur(0px)' : 'blur(8px)',
            transitionProperty: 'opacity, transform, filter',
            transitionDuration: '760ms',
            transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
            transitionDelay: active ? `${delayOffset + index * 42}ms` : '0ms',
          }}
        >
          {word}
          {index < words.length - 1 ? '\u00A0' : ''}
        </span>
      ))}
    </span>
  );
}

export default function Mission() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setIsActive(true);
      return;
    }

    let ticking = false;

    const checkVisibility = () => {
      ticking = false;
      const rect = section.getBoundingClientRect();
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
      const hasLeftHero = window.scrollY > 120;
      const shouldAnimate =
        hasLeftHero && rect.top < viewportHeight * 0.62 && rect.bottom > viewportHeight * 0.15;

      setIsActive((current) => (current === shouldAnimate ? current : shouldAnimate));
    };

    const requestCheck = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(checkVisibility);
    };

    checkVisibility();
    window.setTimeout(checkVisibility, 350);
    window.setTimeout(checkVisibility, 1200);

    window.addEventListener('scroll', requestCheck, { passive: true });
    window.addEventListener('wheel', requestCheck, { passive: true });
    window.addEventListener('resize', requestCheck);
    document.addEventListener('mousemove', requestCheck, { passive: true });

    return () => {
      window.removeEventListener('scroll', requestCheck);
      window.removeEventListener('wheel', requestCheck);
      window.removeEventListener('resize', requestCheck);
      document.removeEventListener('mousemove', requestCheck);
    };
  }, []);

  return (
    <section
      id="mission"
      ref={sectionRef}
      data-mission-section="true"
      className="relative w-full overflow-hidden bg-background-warm px-6 py-24 text-center md:px-12 md:py-32 border-b border-earth/10"
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-pine-green/50 via-pine-green/18 to-transparent md:h-52"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center">
        <p className="mb-5 font-body text-sm md:text-base font-medium tracking-wide text-earth">
          <WordReveal text={eyebrow} className="block" active={isActive} />
        </p>

        <h2 className="font-heading text-4xl md:text-6xl lg:text-7xl leading-[1.05] tracking-tight text-pine-green">
          <WordReveal text={heading} className="block" active={isActive} delayOffset={160} />
        </h2>

        <p className="mt-8 max-w-3xl font-body text-base md:text-xl leading-relaxed text-text-muted font-light">
          <WordReveal text={body} className="block" active={isActive} delayOffset={380} />
        </p>
      </div>
    </section>
  );
}
