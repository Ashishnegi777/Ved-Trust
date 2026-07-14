import { useState, useEffect } from 'react';
import { Menu, X, ArrowUpRight } from 'lucide-react';
import vedTrustLogo from '../assets/images/ved_trust_logo.jpeg';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const currentPath = window.location.pathname.replace(/\/$/, '') || '/';
  const isServicesPage = currentPath === '/services';
  const useSolidHeader = isScrolled || isServicesPage;

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setIsMobileMenuOpen(false);
    if (window.location.pathname !== '/') {
      window.location.href = `/#${id}`;
      return;
    }

    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const goHome = () => {
    setIsMobileMenuOpen(false);
    if (window.location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    window.location.href = '/';
  };

  const goToServices = () => {
    setIsMobileMenuOpen(false);
    if (currentPath !== '/services') {
      window.location.href = '/services';
      return;
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <nav
      id="navbar"
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ease-in-out ${
        useSolidHeader
          ? 'bg-background-warm/80 backdrop-blur-md border-b border-earth/20 py-4'
          : 'bg-transparent py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
        <button
          onClick={goHome}
          className={`flex items-center gap-3 cursor-pointer focus:outline-none transition-opacity hover:opacity-85 ${
            useSolidHeader ? 'text-pine-green' : 'text-white'
          }`}
          aria-label="Go to Ved Trust home"
        >
          <img
            src={vedTrustLogo}
            alt="Ved Trust logo"
            className="h-10 w-10 md:h-12 md:w-12 rounded-full object-cover bg-white shadow-sm ring-1 ring-white/70"
          />
          <span className="font-heading text-2xl md:text-3xl tracking-tight drop-shadow-sm">
            Ved Trust
          </span>
        </button>

        {/* Center Desktop Nav */}
        <div className={`hidden md:flex items-center space-x-12 text-sm font-medium ${
          useSolidHeader ? 'text-text-muted' : 'text-white/85'
        }`}>
          <button
            onClick={() => scrollToSection('about')}
            className="hover:text-pine-green transition-colors cursor-pointer"
          >
            About
          </button>
          <button
            onClick={() => scrollToSection('pillars')}
            className="hover:text-pine-green transition-colors cursor-pointer"
          >
            Our Work
          </button>
          <button
            onClick={goToServices}
            className={`transition-colors cursor-pointer ${
              isServicesPage ? 'text-pine-green' : 'hover:text-pine-green'
            }`}
          >
            Services
          </button>
          <button
            onClick={() => scrollToSection('gallery')}
            className="hover:text-pine-green transition-colors cursor-pointer"
          >
            Gallery
          </button>
          <button
            onClick={() => scrollToSection('contact')}
            className="hover:text-pine-green transition-colors cursor-pointer"
          >
            Contact
          </button>
        </div>

        {/* Right Desktop CTA */}
        <div className="hidden md:block">
          <button
            onClick={() => scrollToSection('contact')}
            className="group flex items-center gap-1.5 px-5 py-2.5 bg-pine-green text-background-warm text-xs font-semibold rounded-full hover:bg-earth hover:text-text-charcoal transition-all duration-300 shadow-sm"
          >
            Reach Out
            <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className={`md:hidden transition-colors ${
            useSolidHeader ? 'text-text-charcoal hover:text-pine-green' : 'text-white hover:text-earth'
          }`}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Full-screen Mobile Menu */}
      <div
        className={`fixed inset-0 top-[60px] md:hidden bg-background-warm/95 backdrop-blur-lg z-40 transition-all duration-500 ease-in-out ${
          isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex flex-col items-center justify-center h-[calc(100vh-60px)] space-y-8 px-6 pb-24 text-center">
          <button
            onClick={() => scrollToSection('about')}
            className="text-2xl font-heading text-text-charcoal hover:text-pine-green transition-colors"
          >
            About
          </button>
          <button
            onClick={() => scrollToSection('pillars')}
            className="text-2xl font-heading text-text-charcoal hover:text-pine-green transition-colors"
          >
            Our Work
          </button>
          <button
            onClick={goToServices}
            className="text-2xl font-heading text-text-charcoal hover:text-pine-green transition-colors"
          >
            Services
          </button>
          <button
            onClick={() => scrollToSection('gallery')}
            className="text-2xl font-heading text-text-charcoal hover:text-pine-green transition-colors"
          >
            Gallery
          </button>
          <button
            onClick={() => scrollToSection('contact')}
            className="text-2xl font-heading text-text-charcoal hover:text-pine-green transition-colors"
          >
            Contact
          </button>

          <button
            onClick={() => scrollToSection('contact')}
            className="mt-4 flex items-center gap-2 px-8 py-3.5 bg-pine-green text-background-warm text-sm font-semibold rounded-full hover:bg-earth transition-all"
          >
            Reach Out
            <ArrowUpRight size={16} />
          </button>
        </div>
      </div>
    </nav>
  );
}
