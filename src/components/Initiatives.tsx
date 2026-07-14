import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import cowImage from '../assets/images/ccow.webp';
import riverImage from '../assets/images/ganga_rever.png';
import treeImage from '../assets/images/uk_tree.webp';
import womenImage from '../assets/images/wome empowerment.png';
import eduImage from '../assets/images/edu.png';
import PaintSmearImage from './PaintSmearImage';

interface Pillar {
  id: string;
  num: string;
  title: string;
  text: string;
  img: string;
}

const pillars: Pillar[] = [
  {
    id: 'education',
    num: '01',
    title: 'Free Education',
    text: 'Creating access to learning for children who need support the most.',
    img: eduImage,
  },
  {
    id: 'empowerment',
    num: '02',
    title: 'Women Empowerment',
    text: 'Helping women build confidence, skills, independence, and dignity.',
    img: womenImage,
  },
  {
    id: 'cowshelter',
    num: '03',
    title: 'Cow Shelter',
    text: 'Providing care, shelter, and protection for cows with compassion.',
    img: cowImage,
  },
  {
    id: 'planting',
    num: '04',
    title: 'Tree Planting',
    text: 'Planting trees to protect local ecosystems, restore balance, and serve future generations.',
    img: treeImage,
  },
  {
    id: 'cleanriver',
    num: '05',
    title: 'Clean River',
    text: 'Cleaning and protecting rivers so villages can grow around safer water, healthier land, and restored natural life.',
    img: riverImage,
  },
];

export default function Initiatives() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      cardsRef.current.forEach((card, index) => {
        if (!card) return;
        
        // Staggered reveal animation based on vertical scrolling
        gsap.fromTo(
          card,
          { opacity: 0, y: 60 },
          {
            opacity: 1,
            y: 0,
            duration: 1.4,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: card,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="pillars"
      ref={containerRef}
      data-blur-reveal
      className="relative w-full py-24 md:py-36 bg-background-warm overflow-hidden border-b border-earth/10"
    >
      <div className="relative z-10 max-w-[1480px] mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] gap-12 lg:gap-20">
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <span className="text-earth font-mono text-xs uppercase tracking-widest font-semibold block mb-4">
              02 // Our Core Pillars
            </span>

            <h2 className="text-pine-green font-heading text-4xl md:text-6xl lg:text-5xl tracking-tight leading-[0.98]">
              Five Initiatives, One Unified Care
            </h2>

            <p className="mt-6 font-body text-text-muted text-sm md:text-base font-light leading-relaxed">
              We pair CS/IT research with direct community work, shaping each programme around the real needs of Uttarakhand&apos;s rural communities.
            </p>

            <div className="mt-10 border-t border-earth/20 pt-6">
              <div className="flex flex-col gap-1 font-body text-sm font-semibold uppercase tracking-tight">
                <span className="text-text-charcoal">All Seva</span>
                {pillars.map((pillar) => (
                  <span key={pillar.id} className="text-text-muted/70 transition-colors hover:text-pine-green">
                    {pillar.title}
                  </span>
                ))}
              </div>

              <div className="mt-16 hidden lg:block font-body text-sm font-semibold uppercase tracking-tight text-text-charcoal">
                Pillars({pillars.length.toString().padStart(2, '0')})
              </div>
            </div>
          </aside>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-3 gap-y-12 lg:gap-x-4 lg:gap-y-16">
          {pillars.map((pillar, index) => {
            const isFeatureCard = index === pillars.length - 1;
            const imageClass = isFeatureCard ? 'aspect-[16/8] md:aspect-[16/7]' : 'aspect-[4/5]';
            const cardClass = isFeatureCard ? 'md:col-span-2' : '';

            return (
              <article
                key={pillar.id}
                ref={(el) => { cardsRef.current[index] = el; }}
                className={`group cursor-pointer ${cardClass}`}
                data-cursor
              >
                <div className={`image-light-sweep relative w-full ${imageClass} overflow-hidden rounded-[4px] bg-earth/10`}>
                  <PaintSmearImage
                    src={pillar.img}
                    alt={pillar.title}
                    className="h-full w-full scale-[1.035] transition-transform duration-[1100ms] ease-out group-hover:scale-100"
                    radius={isFeatureCard ? 0.095 : 0.14}
                    decay={0.93}
                    strength={1.05}
                    displaceScale={0.03}
                    streak={isFeatureCard ? 0.065 : 0.085}
                  />

                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-text-charcoal/55 via-text-charcoal/5 to-transparent opacity-70 transition-opacity duration-700 group-hover:opacity-45" />

                  <div className="pointer-events-none absolute left-4 top-4 flex items-center gap-3 text-background-warm">
                    <span className="font-mono text-[10px] uppercase tracking-[0.28em]">
                      {pillar.num}
                    </span>
                    <span className="h-[1px] w-8 bg-background-warm/50 transition-all duration-500 group-hover:w-14 group-hover:bg-earth" />
                  </div>

                  <div className="pointer-events-none absolute right-4 top-4 h-2 w-2 rounded-full bg-earth shadow-[0_0_24px_rgba(200,164,106,0.85)]" />
                </div>

                <div className="mt-5 grid grid-cols-[auto_1fr] gap-x-5 gap-y-3">
                  <span className="pt-1 font-mono text-[10px] uppercase tracking-[0.26em] text-earth">
                    {pillar.num}
                  </span>

                  <div>
                    <h3 className="font-heading text-3xl md:text-4xl tracking-tight leading-none text-text-charcoal transition-colors duration-300 group-hover:text-pine-green">
                      {pillar.title}
                    </h3>

                    <p className="mt-3 max-w-xl font-body text-sm md:text-base text-text-muted font-light leading-relaxed">
                      {pillar.text}
                    </p>

                    <div className="mt-5 h-[1px] w-full bg-earth/15 overflow-hidden">
                      <div className="h-full w-10 bg-earth transition-all duration-700 group-hover:w-full" />
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
          </div>
        </div>
      </div>
    </section>
  );
}
