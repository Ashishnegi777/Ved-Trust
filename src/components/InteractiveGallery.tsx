import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import cowImage from '../assets/images/ccow.webp';
import medicalAidImage from '../assets/images/medical aid.png';
import riverImage from '../assets/images/ganga_rever.png';
import treeImage from '../assets/images/uk_tree.webp';
import womenImage from '../assets/images/wome empowerment.png';
import { fetchPublishedGalleryItems, type GalleryDisplayItem } from '../lib/gallery';

interface GalleryItem extends GalleryDisplayItem {
  img: string;
  caption: string;
  location: string;
  widthClass: string;
}

const defaultGalleryItems: GalleryItem[] = [
  {
    id: 'medical-aid',
    img: medicalAidImage,
    caption: 'Medical aid with dignity',
    location: 'Healthcare Support',
    widthClass: 'w-[280px] sm:w-[380px] md:w-[480px]',
  },
  {
    id: 'women-empowerment',
    img: womenImage,
    caption: 'Hands that build confidence',
    location: 'Women Empowerment',
    widthClass: 'w-[240px] sm:w-[320px] md:w-[400px]',
  },
  {
    id: 'cow-shelter',
    img: cowImage,
    caption: 'Care beyond words',
    location: 'Cow Shelter',
    widthClass: 'w-[300px] sm:w-[420px] md:w-[520px]',
  },
  {
    id: 'tree-planting',
    img: treeImage,
    caption: 'Planting for tomorrow',
    location: 'Tree Planting',
    widthClass: 'w-[260px] sm:w-[360px] md:w-[450px]',
  },
  {
    id: 'clean-river',
    img: riverImage,
    caption: 'Clean rivers, healthy villages',
    location: 'Clean River',
    widthClass: 'w-[320px] sm:w-[450px] md:w-[560px]',
  },
];

export default function InteractiveGallery() {
  const pinSectionRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>(defaultGalleryItems);

  useEffect(() => {
    let cancelled = false;

    fetchPublishedGalleryItems()
      .then((uploadedItems) => {
        if (!cancelled && uploadedItems.length > 0) {
          setGalleryItems(uploadedItems);
        }
      })
      .catch(() => {
        // Keep the locally bundled gallery visible if Supabase is not configured yet.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const pinSection = pinSectionRef.current;
    const scrollContainer = scrollContainerRef.current;

    if (!pinSection || !scrollContainer) return;

    const ctx = gsap.context(() => {
      // Create horizontal scroll on desktop screens, or a standard scroll on smaller ones
      const isMobile = window.innerWidth < 768;

      if (!isMobile) {
        const getScrollAmount = () => {
          return -(scrollContainer.scrollWidth - window.innerWidth);
        };

        gsap.to(scrollContainer, {
          x: getScrollAmount,
          ease: 'none',
          scrollTrigger: {
            trigger: pinSection,
            pin: true,
            scrub: 1,
            start: 'top top',
            end: () => `+=${scrollContainer.scrollWidth - window.innerWidth}`,
            invalidateOnRefresh: true,
          },
        });
      }
    }, pinSection);

    return () => ctx.revert();
  }, [galleryItems.length]);

  return (
    <section
      id="gallery"
      ref={pinSectionRef}
      data-blur-reveal
      className="relative w-full bg-background-warm overflow-hidden border-b border-earth/10 md:h-screen flex items-center"
    >
      {/* 
        Horizontal scroll row (Desktop) / Vertical stacked list with side scroll fallback (Mobile)
      */}
      <div
        ref={scrollContainerRef}
        className="relative z-10 flex flex-col md:flex-row items-stretch md:items-center py-16 md:py-0 px-6 md:px-12 gap-8 md:gap-16 w-full md:w-max h-full"
      >
        {/* Gallery Intro Card */}
        <div className="flex flex-col justify-center min-w-[280px] md:min-w-[450px] pr-4 md:pr-12 md:h-full py-12 md:py-0">
          <span className="text-earth font-mono text-xs uppercase tracking-widest font-semibold block mb-3">
            04 // Moments of Seva
          </span>
          <h2 className="text-pine-green font-heading text-4xl md:text-6xl tracking-tight leading-tight mb-4">
            Our Journey in Frames
          </h2>
          <p className="font-body text-text-muted text-sm md:text-base font-light leading-relaxed mb-6">
            A quiet documentation of our daily work, the care we share, the trees we plant, and the communities we serve across India.
          </p>
          <div className="hidden md:flex items-center gap-2 text-earth font-mono text-xs">
            <span className="animate-pulse">●</span> Scroll to wander through
          </div>
        </div>

        {/* Gallery Scroll Cards */}
        <div className="flex flex-col md:flex-row gap-8 md:gap-16 items-stretch md:items-center">
          {galleryItems.map((item) => (
            <div
              key={item.id}
              className={`flex-shrink-0 flex flex-col gap-4 group ${item.widthClass}`}
            >
              <div className="image-light-sweep relative aspect-[3/4] md:aspect-[4/5] rounded-2xl overflow-hidden bg-earth/5 shadow-md">
                <img
                  src={item.img}
                  alt={item.caption}
                  className="w-full h-full object-cover scale-100 group-hover:scale-[1.03] transition-transform duration-700 ease-out"
                  referrerPolicy="no-referrer"
                />
                {/* Micro-hover frame ring */}
                <div className="absolute inset-0 border border-background-warm/30 rounded-2xl m-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-t from-pine-green/45 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              </div>
              
              <div className="flex flex-col gap-1 pl-2">
                <h4 className="font-heading text-xl md:text-2xl text-text-charcoal group-hover:text-pine-green transition-colors">
                  {item.caption}
                </h4>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-earth" />
                  <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
                    {item.location}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
