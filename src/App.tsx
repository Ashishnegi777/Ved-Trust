/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import SmoothScroll from './components/SmoothScroll';
import ScrollLine from './components/ScrollLine';
import BlurReveal from './components/BlurReveal';
import AestheticCursor from './components/AestheticCursor';
import ScreenLoader from './components/ScreenLoader';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Mission from './components/Mission';
import About from './components/About';
import Initiatives from './components/Initiatives';
import ImpactStory from './components/ImpactStory';
import InteractiveGallery from './components/InteractiveGallery';
import JourneyLines from './components/JourneyLines';
import Services from './components/Services';
import Contact from './components/Contact';
import AdminGallery from './components/AdminGallery';

export default function App() {
  const pathname = window.location.pathname.replace(/\/$/, '');
  const isServicesPage = pathname === '/services';
  const isGalleryAdminPage = pathname === '/admin/gallery';

  return (
    <div className="relative min-h-screen bg-background-warm text-text-charcoal font-body antialiased selection:bg-earth/30 selection:text-pine-green">
      {!isGalleryAdminPage && <ScreenLoader />}

      {!isGalleryAdminPage && <div className="site-grain pointer-events-none fixed inset-0 z-[2]" aria-hidden="true" />}

      {!isGalleryAdminPage && <SmoothScroll />}

      {!isGalleryAdminPage && <ScrollLine />}

      {!isGalleryAdminPage && <BlurReveal />}

      {!isGalleryAdminPage && <AestheticCursor />}

      {!isGalleryAdminPage && <Navbar />}

      {isGalleryAdminPage ? (
        <AdminGallery />
      ) : isServicesPage ? (
        <Services />
      ) : (
        <>
          {/* Scroll-drawn journey line from About to footer */}
          <JourneyLines />

          <main>
            {/* Cinematic parallax landscape */}
            <Hero />

            {/* Mission statement with word-by-word reveal */}
            <Mission />

            {/* Spacious editorial intro */}
            <About />

            {/* Staggered pillars list */}
            <Initiatives />

            {/* Visual progress-tracked storytelling */}
            <ImpactStory />

            {/* Vertical-pin horizontal gallery */}
            <InteractiveGallery />
          </main>
        </>
      )}

      {!isGalleryAdminPage && <Contact />}
    </div>
  );
}
