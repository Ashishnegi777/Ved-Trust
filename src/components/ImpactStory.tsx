import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import medicalAidImage from '../assets/images/medical aid.png';

export default function ImpactStory() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const progressLineActiveRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const imageWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        progressLineActiveRef.current,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 70%',
            end: 'bottom 30%',
            scrub: true,
          },
        }
      );

      gsap.fromTo(
        contentRef.current,
        { opacity: 0, x: -30 },
        {
          opacity: 1,
          x: 0,
          duration: 1.4,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 60%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      gsap.fromTo(
        imageWrapperRef.current,
        { opacity: 0, scale: 0.95 },
        {
          opacity: 1,
          scale: 1,
          duration: 1.6,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 65%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="impact-story"
      ref={sectionRef}
      data-blur-reveal
      className="relative w-full py-24 md:py-36 bg-[#F3EEE3] overflow-hidden border-b border-earth/10"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 items-center">
          <div className="lg:col-span-7 flex gap-6 md:gap-10 items-start">
            <div className="flex flex-col items-center gap-4 py-2">
              <span className="font-mono text-[10px] text-earth font-semibold tracking-widest uppercase rotate-90 my-3">
                Live
              </span>
              <div className="w-[2px] h-32 md:h-48 bg-earth/20 rounded-full relative overflow-hidden">
                <div
                  ref={progressLineActiveRef}
                  className="absolute top-0 left-0 w-full h-full bg-pine-green origin-top"
                  style={{ transform: 'scaleY(0)' }}
                />
              </div>
              <span className="font-mono text-[10px] text-earth font-semibold tracking-widest uppercase rotate-90 my-3">
                Flow
              </span>
            </div>

            <div ref={contentRef} className="flex flex-col gap-6 md:gap-8">
              <span className="text-earth font-mono text-xs uppercase tracking-widest font-semibold block">
                03 // Impact story
              </span>

              <h2 className="font-heading text-4xl md:text-6xl text-text-charcoal leading-[1.1] tracking-tight">
                Small acts of service, growing into lasting change.
              </h2>

              <p className="font-body text-base md:text-lg text-text-muted leading-relaxed font-light max-w-xl">
                From helping a child continue school to supporting healthcare access, every effort is part of a larger promise - to serve people, animals, and nature with sincerity.
              </p>

              <blockquote className="border-l-2 border-earth pl-6 my-2 italic font-heading text-xl md:text-2xl text-pine-green">
                "We seek to support lives across India with dignity, care, and sincere service."
              </blockquote>
            </div>
          </div>

          <div ref={imageWrapperRef} className="lg:col-span-5">
            <div className="image-light-sweep relative rounded-2xl overflow-hidden aspect-[3/4] bg-earth/10 shadow-lg group">
              <img
                src={medicalAidImage}
                alt="Medical aid support by Ved Trust"
                className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-700 ease-out"
              />
              <div className="absolute inset-0 border border-background-warm/20 pointer-events-none rounded-2xl m-3" />
              <div className="absolute bottom-6 left-6 z-10 text-background-warm">
                <p className="font-mono text-[10px] uppercase tracking-wider opacity-80 mb-1">Medical Aid</p>
                <h4 className="font-heading text-lg">Care That Reaches People</h4>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
