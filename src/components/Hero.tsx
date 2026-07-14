import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ArrowDown } from 'lucide-react';
import himalayanPeaks from '../assets/images/hills.jpg';
import HeroShaderTitle from './HeroShaderTitle';

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const mistRef = useRef<HTMLDivElement>(null);
  const foregroundRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const image = imageRef.current;
    const mist = mistRef.current;
    const foreground = foregroundRef.current;
    const content = contentRef.current;

    const ctx = gsap.context(() => {
      gsap.to(image, {
        yPercent: 18,
        scale: 1.08,
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });

      gsap.to(mist, {
        yPercent: 28,
        opacity: 0.64,
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });

      gsap.to(foreground, {
        yPercent: -16,
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });

      gsap.fromTo(
        content,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 1.6, ease: 'power3.out', delay: 0.3 }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      id="hero"
      ref={containerRef}
      className="relative w-full h-screen min-h-[680px] overflow-hidden bg-text-charcoal flex items-center justify-center select-none"
    >
      <div
        ref={imageRef}
        className="absolute inset-x-0 -top-[12%] h-[124%] bg-cover bg-center will-change-transform"
        style={{
          backgroundImage: `url(${himalayanPeaks})`,
          filter: 'brightness(0.88) contrast(1.08) saturate(1.03)',
        }}
      />

      <div
        ref={mistRef}
        className="absolute inset-x-0 bottom-0 h-[50%] bg-gradient-to-t from-pine-green/55 via-pine-green/30 to-transparent opacity-55 pointer-events-none will-change-transform"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-sky/20 via-text-charcoal/8 to-text-charcoal/45 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_42%,rgba(31,31,28,0.48)_100%)] pointer-events-none" />

      <div
        ref={contentRef}
        className="relative z-20 max-w-5xl mx-auto px-6 text-center text-background-warm mt-[-28px] drop-shadow-[0_4px_24px_rgba(0,0,0,0.42)]"
      >
        <div className="inline-block px-4 py-1.5 mb-6 border border-white/30 rounded-full bg-text-charcoal/30 backdrop-blur-sm text-white text-sm md:text-base font-medium tracking-wide">
          बहुजन हिताय बहुजन सुखाय।
        </div>

        <HeroShaderTitle
          text="A new chapter for rural Uttrakhand begins here."
          className="font-heading text-5xl md:text-7xl lg:text-8xl tracking-tight leading-[1.02] mb-6"
        />

        <p className="font-body text-base md:text-lg lg:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed mb-10 font-light">
          Ved Trust works for free education, women&apos;s dignity, cow shelter, and a greener future across communities in India.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => scrollToSection('about')}
            className="w-full sm:w-auto px-8 py-3.5 bg-background-warm text-text-charcoal font-medium rounded-full text-sm hover:bg-earth hover:text-text-charcoal shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
          >
            Explore Our Work
          </button>
          <button
            onClick={() => scrollToSection('contact')}
            className="w-full sm:w-auto px-8 py-3.5 bg-text-charcoal/30 border border-white/35 backdrop-blur-md text-white font-medium rounded-full text-sm hover:bg-background-warm hover:text-text-charcoal transition-all duration-300 cursor-pointer"
          >
            Contact Ved Trust
          </button>
        </div>
      </div>

      <div
        ref={foregroundRef}
        className="absolute bottom-[-8%] left-0 w-full h-[34%] bg-gradient-to-t from-pine-green/80 via-pine-green/55 to-transparent opacity-85 z-10 pointer-events-none will-change-transform"
      />

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 cursor-pointer" onClick={() => scrollToSection('mission')}>
        <span className="text-[10px] uppercase tracking-widest text-white/80">Scroll to Begin</span>
        <div className="p-1 rounded-full border border-white/50 bg-text-charcoal/20 backdrop-blur-sm animate-bounce">
          <ArrowDown size={14} className="text-white" />
        </div>
      </div>
    </section>
  );
}
