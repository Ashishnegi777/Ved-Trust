import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import reliefHeightMap from '../assets/images/relief-height-map.png';
import reliefNormalMap from '../assets/images/relief-normal-map.png';
import ReliefLightLayer from './ReliefLightLayer';

export default function About() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const textContainerRef = useRef<HTMLDivElement>(null);
  const path1Ref = useRef<SVGPathElement>(null);
  const path2Ref = useRef<SVGPathElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Fade and slide the typography components gently
      gsap.fromTo(
        textContainerRef.current?.children || [],
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 1.2,
          stagger: 0.25,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 75%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Animate the SVG line artwork drawing on scroll
      if (path1Ref.current) {
        const length = path1Ref.current.getTotalLength();
        gsap.set(path1Ref.current, { strokeDasharray: length, strokeDashoffset: length });
        gsap.to(path1Ref.current, {
          strokeDashoffset: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
            end: 'bottom 20%',
            scrub: 1,
          },
        });
      }

      if (path2Ref.current) {
        const length = path2Ref.current.getTotalLength();
        gsap.set(path2Ref.current, { strokeDasharray: length, strokeDashoffset: length });
        gsap.to(path2Ref.current, {
          strokeDashoffset: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 70%',
            end: 'bottom 10%',
            scrub: 1.2,
          },
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="about"
      ref={sectionRef}
      data-blur-reveal
      className="relative w-full min-h-[70vh] flex items-center py-24 md:py-36 overflow-hidden bg-background-warm border-b border-earth/10"
    >
      {/* Subtle Animated Line Art in the Background */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-15">
        <svg
          className="absolute right-0 top-12 w-[600px] h-[400px] text-earth"
          viewBox="0 0 600 400"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
        >
          {/* Mountain contours contour line */}
          <path
            ref={path1Ref}
            d="M 50,300 C 150,220 220,120 300,180 C 380,240 450,140 550,80"
          />
        </svg>

        <svg
          className="absolute left-10 bottom-10 w-[500px] h-[300px] text-pine-green"
          viewBox="0 0 500 300"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
        >
          {/* River winding line */}
          <path
            ref={path2Ref}
            d="M 20,50 C 120,80 180,220 280,180 C 380,140 420,260 480,240"
          />
        </svg>

        {/* Tree ring pattern circles */}
        <svg
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] text-earth opacity-20"
          viewBox="0 0 100 100"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.5"
        >
          <circle cx="50" cy="50" r="10" strokeDasharray="1,2" />
          <circle cx="50" cy="50" r="20" strokeDasharray="2,2" />
          <circle cx="50" cy="50" r="30" strokeDasharray="1,1" />
          <circle cx="50" cy="50" r="40" strokeDasharray="3,1" />
        </svg>
      </div>

      {/* Main Editorial Grid */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 w-full">
        <div ref={textContainerRef} className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-16 items-start">
          
          {/* Left Side: Editorial Label */}
          <div className="md:col-span-4 flex flex-col gap-3">
            <span className="text-earth font-mono text-xs uppercase tracking-widest font-semibold">
              01 // The Foundation
            </span>
            <h2 className="text-pine-green font-heading text-4xl md:text-5xl tracking-tight">
              About Ved Trust
            </h2>
            <ReliefLightLayer
              normalMapSrc={reliefNormalMap}
              heightMapSrc={reliefHeightMap}
              fill={false}
              className="mt-4 h-36 w-56 max-w-full rounded-sm bg-background-warm md:h-40 md:w-64"
              reliefCenter={[0.5, 0.5]}
              reliefScale={0.88}
              revealRadius={0.48}
              lightHeight={0.14}
              specStrength={0.42}
              shininess={34}
              ambient={0.22}
              baseColor="#f6f4ed"
              lightColor="#ffffff"
            />
            <div className="w-12 h-[1px] bg-earth/40 mt-2" />
          </div>

          {/* Right Side: Primary Narrative */}
          <div className="md:col-span-8 flex flex-col gap-6">
            <p className="font-heading text-3xl md:text-5xl lg:text-5xl text-text-charcoal leading-[1.15] tracking-tight font-normal">
              Rooted in Uttarakhand, Ved Trust is a research-led public trust working across computer science, information technology, education, dignity, compassion, and environmental care.
            </p>
            
            <p className="font-body text-base md:text-lg text-text-muted leading-relaxed font-light max-w-3xl">
              Our research explores useful computing and information technology for learning, local systems, and community resilience. Alongside it, we support children with modern tools, help rural women towards self-reliance, protect cows with specialized shelters, and plant native trees for future generations.
            </p>

            <div className="flex items-center gap-8 mt-4">
              <div className="flex flex-col">
                <span className="font-heading text-4xl text-pine-green">100%</span>
                <span className="font-mono text-[10px] uppercase text-text-muted">Community Lead</span>
              </div>
              <div className="w-[1px] h-8 bg-earth/20" />
              <div className="flex flex-col">
                <span className="font-heading text-4xl text-pine-green">Direct</span>
                <span className="font-mono text-[10px] uppercase text-text-muted">Impact Model</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
