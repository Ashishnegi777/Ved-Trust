import { Mail, Phone, MapPin, ArrowUp } from 'lucide-react';

export default function Contact() {
  const currentYear = new Date().getFullYear();

  const handleBackToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section
      id="contact"
      data-blur-reveal
      className="relative w-full bg-[#1F1F1C] text-[#F7F3EA] pt-24 pb-12 overflow-hidden"
    >
      {/* Background organic ring pattern (extremely low contrast) */}
      <div className="absolute inset-0 pointer-events-none opacity-5">
        <svg
          className="absolute -right-40 -bottom-40 w-[800px] h-[800px] text-[#C8A46A]"
          viewBox="0 0 100 100"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.2"
        >
          <circle cx="50" cy="50" r="10" />
          <circle cx="50" cy="50" r="20" />
          <circle cx="50" cy="50" r="30" />
          <circle cx="50" cy="50" r="40" />
          <circle cx="50" cy="50" r="50" />
        </svg>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 w-full">
        
        {/* Main Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 pb-20 border-b border-background-warm/10">
          
          {/* Left Column: Mission Narrative and Call to Connect */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            <div className="flex flex-col gap-6 max-w-xl">
              <span className="text-earth font-mono text-xs uppercase tracking-widest font-semibold">
                05 // Reach Out
              </span>
              <h2 className="font-heading text-5xl md:text-7xl tracking-tight leading-none text-[#F7F3EA]">
                Connect With Ved Trust
              </h2>
              <p className="font-body text-[#6F6A5F] text-base md:text-lg font-light leading-relaxed">
                To collaborate on CS/IT research, support a community initiative, volunteer, or learn more about Ved Trust, please reach out directly.
              </p>
              
              <div className="mt-4">
                <a
                  href="mailto:ved.trust@hotmail.com"
                  className="inline-flex items-center gap-2.5 px-8 py-4 bg-[#3F5F45] text-[#F7F3EA] text-sm font-semibold rounded-full hover:bg-[#C8A46A] hover:text-[#1F1F1C] transition-all duration-300 shadow-lg cursor-pointer"
                >
                  <Mail size={16} />
                  Write to Us
                </a>
              </div>
            </div>

            <div className="hidden lg:block mt-16">
              <div className="text-earth font-heading text-2xl italic tracking-wide">
                "In service of the mountains and the souls within them."
              </div>
            </div>
          </div>

          {/* Right Column: Precise Contact details */}
          <div className="lg:col-span-5 flex flex-col gap-10 lg:pl-12">
            
            <div className="flex flex-col gap-2">
              <h4 className="font-mono text-xs uppercase tracking-wider text-earth font-semibold">
                General Queries
              </h4>
              <div className="h-[1px] w-full bg-background-warm/10 mb-2" />
              
              <div className="flex flex-col gap-6 mt-2">
                {/* Email item */}
                <div className="flex gap-4 items-start group">
                  <div className="p-3 rounded-full bg-background-warm/5 text-[#C8A46A] group-hover:bg-[#3F5F45] group-hover:text-[#F7F3EA] transition-all duration-300">
                    <Mail size={18} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-wider font-mono text-[#6F6A5F]">Send an Email</span>
                    <a href="mailto:ved.trust@hotmail.com" className="text-base font-medium hover:text-earth transition-colors">
                      ved.trust@hotmail.com
                    </a>
                  </div>
                </div>

                {/* Phone item */}
                <div className="flex gap-4 items-start group">
                  <div className="p-3 rounded-full bg-background-warm/5 text-[#C8A46A] group-hover:bg-[#3F5F45] group-hover:text-[#F7F3EA] transition-all duration-300">
                    <Phone size={18} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-wider font-mono text-[#6F6A5F]">Call or WhatsApp</span>
                    <a href="tel:+919971997198" className="text-base font-medium hover:text-earth transition-colors">
                      +91 99719 97198
                    </a>
                  </div>
                </div>

                {/* Location item */}
                <div className="flex gap-4 items-start group">
                  <div className="p-3 rounded-full bg-background-warm/5 text-[#C8A46A] group-hover:bg-[#3F5F45] group-hover:text-[#F7F3EA] transition-all duration-300">
                    <MapPin size={18} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-wider font-mono text-[#6F6A5F]">Find Us At</span>
                    <address className="text-base font-medium not-italic leading-relaxed">
                      C/O Geeta Tanda, Kothiyal Road,<br />
                      Dinkervihar, Vikasnagar,<br />
                      Dehradun - 248198, Uttarakhand
                    </address>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 mt-4 bg-background-warm/5 p-6 rounded-2xl border border-background-warm/10">
              <span className="font-mono text-[10px] uppercase text-earth tracking-widest font-semibold block mb-1">
                Support Notice
              </span>
              <p className="font-body text-xs text-[#6F6A5F] leading-relaxed">
                Ved Trust welcomes research collaborations, institutional partnerships, volunteer support, and community-led initiatives. For donations or project discussions, please connect by email or phone.
              </p>
            </div>

          </div>

        </div>

        {/* Footer Area */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-12 text-xs text-[#6F6A5F] font-mono gap-6">
          <div>
            &copy; {currentYear} Ved Trust. Research, service, and community care.
          </div>
          
          <button
            onClick={handleBackToTop}
            className="flex items-center gap-2 group px-4 py-2 rounded-full border border-background-warm/10 hover:border-earth/40 hover:text-earth transition-all cursor-pointer"
          >
            <span>Back to Top</span>
            <ArrowUp size={12} className="group-hover:translate-y-[-2px] transition-transform" />
          </button>
        </div>

      </div>
    </section>
  );
}
