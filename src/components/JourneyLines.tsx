import { useEffect, useRef, useState } from 'react';

const paths = [
  {
    d: 'M 1.1 0 C 3.2 10 0.8 21 2.2 34 C 3.8 48 0.9 61 2.6 75 C 4 88 1.8 95 3.4 100',
    stroke: 'rgba(200, 164, 106, 0.56)',
    width: 1.35,
  },
  {
    d: 'M 98.9 0 C 96.8 12 99.2 24 97.6 37 C 95.9 53 99 66 97.1 81 C 95.9 91 98.3 97 96.8 100',
    stroke: 'rgba(63, 95, 69, 0.26)',
    width: 0.95,
  },
];

type LineLayout = {
  top: number;
  height: number;
};

function clamp(value: number, min = 0, max = 1) {
  return Math.min(Math.max(value, min), max);
}

export default function JourneyLines() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const clipRef = useRef<HTMLDivElement>(null);
  const layoutRef = useRef<LineLayout>({ top: 0, height: 0 });
  const layoutCacheRef = useRef<LineLayout>({ top: 0, height: 0 });
  const [layout, setLayout] = useState<LineLayout>({
    top: 0,
    height: 0,
  });

  useEffect(() => {
    let resizeFrame = 0;
    const timers: number[] = [];

    const measure = () => {
      const about = document.getElementById('about');
      const gallery = document.getElementById('gallery');
      const impactStory = document.getElementById('impact-story');

      if (!about) return;

      const pageTop = window.scrollY || window.pageYOffset || 0;
      const viewportHeight = window.innerHeight || 1;
      const aboutRect = about.getBoundingClientRect();
      const galleryRect = gallery?.getBoundingClientRect();
      const impactRect = impactStory?.getBoundingClientRect();
      const top = Math.max(0, aboutRect.top + pageTop - viewportHeight * 0.05);
      const bottom = gallery
        ? galleryRect!.top + pageTop - 96
        : impactStory
          ? impactRect!.bottom + pageTop
          : top + viewportHeight;
      const height = Math.max(viewportHeight * 0.8, bottom - top);
      const nextLayout = {
        top,
        height,
      };
      layoutRef.current = nextLayout;

      const previousLayout = layoutCacheRef.current;
      const didLayoutChange =
        Math.abs(previousLayout.top - nextLayout.top) > 1 ||
        Math.abs(previousLayout.height - nextLayout.height) > 1;

      if (didLayoutChange) {
        layoutCacheRef.current = nextLayout;
        setLayout(nextLayout);
      }
    };

    const requestMeasure = () => {
      window.cancelAnimationFrame(resizeFrame);
      resizeFrame = window.requestAnimationFrame(measure);
    };

    measure();
    timers.push(window.setTimeout(measure, 250));
    timers.push(window.setTimeout(measure, 900));

    window.addEventListener('resize', requestMeasure);
    window.addEventListener('load', measure);

    return () => {
      window.cancelAnimationFrame(resizeFrame);
      timers.forEach((timer) => window.clearTimeout(timer));
      window.removeEventListener('resize', requestMeasure);
      window.removeEventListener('load', measure);
    };
  }, []);

  useEffect(() => {
    if (!layout.height) return;

    const wrap = wrapRef.current;
    const clip = clipRef.current;
    if (!wrap || !clip) return;

    let frame = 0;

    const render = () => {
      const { top, height } = layoutRef.current;
      const viewportHeight = window.innerHeight || 1;
      const scrollTop = window.scrollY || window.pageYOffset || 0;
      const start = top - viewportHeight * 0.78;
      const end = top + height - viewportHeight * 0.86;
      const progress = clamp((scrollTop - start) / Math.max(1, end - start));

      clip.style.height = `${progress * 100}%`;
      wrap.style.opacity = progress > 0.01 ? '1' : '0';

      frame = window.requestAnimationFrame(render);
    };

    frame = window.requestAnimationFrame(render);

    return () => window.cancelAnimationFrame(frame);
  }, [layout.height, layout.top]);

  if (!layout.height) {
    return null;
  }

  return (
    <div
      ref={wrapRef}
      data-journey-lines
      className="pointer-events-none absolute left-0 z-[6] hidden w-full overflow-hidden opacity-0 md:block"
      style={{
        top: `${layout.top}px`,
        height: `${layout.height}px`,
        maskImage:
          'linear-gradient(to bottom, transparent 0%, black 7%, black 93%, transparent 100%)',
        WebkitMaskImage:
          'linear-gradient(to bottom, transparent 0%, black 7%, black 93%, transparent 100%)',
      }}
      aria-hidden="true"
    >
      <div
        ref={clipRef}
        className="absolute left-0 top-0 w-full overflow-hidden"
        style={{ height: 0 }}
      >
        <svg
          className="absolute left-0 top-0 w-full"
          style={{ height: `${layout.height}px` }}
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          fill="none"
        >
          {paths.map((path, index) => (
            <path
              key={`journey-line-${index}`}
              d={path.d}
              stroke={path.stroke}
              strokeWidth={path.width}
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </svg>
      </div>
    </div>
  );
}
