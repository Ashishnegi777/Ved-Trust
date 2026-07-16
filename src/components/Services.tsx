import { ArrowRight, BrainCircuit, Cpu, Network, Sparkles, WandSparkles } from 'lucide-react';

import genAi from '../assets/images/ml.webp';
import machine from '../assets/images/deep.webp';
import deep from '../assets/images/generative ai.webp';

const services = [
  {
    title: 'AI Development',
    description:
      'Custom AI tools, assistants, and automation systems designed around real organizational workflows.',
    icon: Cpu,
    image:
      deep,
    imagePosition: '58% 42%',
    label: 'Systems & Automation',
  },
  {
    title: 'Machine Learning Models',
    description:
      'Practical model development for prediction, classification, analysis, and decision-support use cases.',
    icon: BrainCircuit,
    image:
      machine,
    imagePosition: '58% 42%',
    label: 'Insight & Prediction',
  },
  {
    title: 'Deep Learning',
    description:
      'Neural-network systems for vision, language, audio, and complex pattern recognition at meaningful scale.',
    icon: Network,
    image:
     machine,
    imagePosition: '64% 40%',
    label: 'Vision & Intelligence',
  },
  {
    title: 'Generative AI',
    description:
      'Grounded copilots and creative AI workflows that turn trusted knowledge into useful everyday output.',
    icon: WandSparkles,
    image:
      genAi,
    imagePosition: '46% 45%',
    label: 'Creation & Co-pilots',
  },
];

export default function Services() {
  return (
    <main className="min-h-screen bg-background-warm pt-32 md:pt-40">
      <section className="relative overflow-hidden border-b border-earth/10 px-6 pb-24 md:px-12 md:pb-32">
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute left-[-8rem] top-20 h-64 w-64 rounded-full border border-earth/30" />
          <div className="absolute right-[-6rem] top-44 h-80 w-80 rounded-full border border-pine-green/20" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-earth/25 bg-white/35 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-earth">
              <Sparkles size={14} />
              Research & Technology
            </div>

            <h1 className="font-heading text-5xl leading-[1.02] tracking-tight text-pine-green md:text-7xl lg:text-8xl">
              CS/IT research for purposeful impact.
            </h1>

            <p className="mt-6 max-w-2xl font-body text-base font-light leading-relaxed text-text-muted md:text-xl">
              Ved Trust researches and develops practical computing systems that support education, operations, outreach, knowledge access, and scalable community work.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8">
            {services.map((service) => {
              const Icon = service.icon;

              return (
                <article
                  key={service.title}
                  className="group overflow-hidden rounded-[8px] border border-earth/15 bg-white/45 shadow-sm transition-all duration-500 hover:-translate-y-1 hover:border-pine-green/35 hover:shadow-xl"
                >
                  <div className="image-light-sweep relative aspect-[16/10] overflow-hidden bg-pine-green">
                    <img
                      src={service.image}
                      alt=""
                      className="h-full w-full object-cover saturate-[0.78] contrast-[1.08] transition-transform duration-[1400ms] ease-out group-hover:scale-105"
                      style={{ objectPosition: service.imagePosition }}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-text-charcoal/80 via-text-charcoal/20 to-transparent" />
                    <div className="absolute inset-x-5 bottom-4 flex items-center justify-between text-background-warm">
                      <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em]">
                        {service.label}
                      </span>
                      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-background-warm/35 bg-text-charcoal/20 backdrop-blur-sm">
                        <Icon size={18} />
                      </div>
                    </div>
                  </div>

                  <div className="p-7 md:p-8">
                    <div className="flex items-start justify-between gap-6">
                      <h2 className="font-heading text-3xl tracking-tight text-text-charcoal md:text-4xl">
                        {service.title}
                      </h2>
                      <ArrowRight
                        size={20}
                        className="mt-2 shrink-0 text-earth transition-transform duration-300 group-hover:translate-x-1"
                      />
                    </div>

                    <p className="mt-4 max-w-xl font-body text-sm font-light leading-relaxed text-text-muted md:text-base">
                      {service.description}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
