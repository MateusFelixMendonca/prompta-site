import { ArrowDown, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { smoothScrollToId } from '../utils/smoothScroll';

interface HeroSectionProps {
  onExploreCourses: () => void;
}

export default function HeroSection({ onExploreCourses }: HeroSectionProps) {
  const scrollToTracks = () => {
    smoothScrollToId('trilhas');
  };

  return (
    <section
      id="topo"
      className="relative bg-transparent pt-6 pb-10 lg:min-h-[calc(100vh-74px)] lg:flex lg:items-center lg:py-12"
    >
      <div className="mx-auto grid w-full max-w-[1380px] grid-cols-1 items-center gap-6 px-6 sm:px-10 lg:grid-cols-12 lg:gap-8 lg:px-12">
        {/* Left column: Enlarged editorial typography occupying the full left half */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 lg:col-span-6"
        >
          <p className="font-mono text-xs font-medium tracking-[0.16em] text-[#2EE6D6] lg:text-[13px]">
            PROMPTA · PROMPTS E KITS DE IA PRONTOS PARA USAR
          </p>

          <h1
            className="mt-3.5 font-display font-semibold tracking-[-0.03em] text-white [text-wrap:balance] lg:mt-4"
            style={{ fontSize: 'clamp(2.75rem, 5.1vw, 5.15rem)', lineHeight: 0.96 }}
          >
            Faça a IA trabalhar por você.
          </h1>

          <p className="mt-5 max-w-[54ch] text-base leading-[1.66] text-zinc-200/90 lg:mt-6 lg:text-[18px] lg:leading-[1.65]">
            Kits de prompts prontos que transformam a IA em uma linha de produção. O primeiro já
            está no ar: vídeos 3D de obra em corte feitos só conversando com o Claude. E o nosso
            curso de IA, do básico ao avançado, chega em breve.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3.5 lg:mt-9 lg:gap-4">
            <button
              type="button"
              onClick={() => smoothScrollToId('prompts')}
              className="glass-btn-primary inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-[15px] font-semibold text-white transition-all duration-150 active:scale-[0.98] whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2EE6D6]"
            >
              Ver os Prompts
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={onExploreCourses}
              className="glass-btn-secondary inline-flex items-center gap-1.5 rounded-full px-6 py-3.5 text-[15px] font-medium text-zinc-100 transition-all duration-150 active:scale-[0.98] whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2EE6D6]"
            >
              Curso de IA (em breve)
            </button>
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-x-2.5 gap-y-1 border-t border-white/[0.08] pt-4 font-mono text-xs text-zinc-300/85 tabular-nums lg:mt-9 lg:flex-nowrap lg:pt-5 lg:text-[13px] whitespace-nowrap">
            <span>Kit Prompo-Constroe no ar</span>
            <span aria-hidden="true" className="text-zinc-500">·</span>
            <span>Curso de IA em breve</span>
            <span aria-hidden="true" className="text-zinc-500">·</span>
            <span>7 dias de garantia Kiwify</span>
          </div>
        </motion.div>

        {/* Right column spacer occupying the right half for the 3D Neural Brain */}
        <div className="relative flex min-h-[240px] sm:min-h-[280px] items-end justify-center lg:col-span-6 lg:min-h-[clamp(400px,64vh,560px)] lg:justify-end">
          <button
            type="button"
            onClick={scrollToTracks}
            className="glass-btn-secondary inline-flex items-center gap-2 rounded-full px-4 py-2.5 font-mono text-[11px] tracking-wide text-zinc-200 transition-all cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2EE6D6]"
          >
            <span>Role para conhecer a Prompta</span>
            <ArrowDown className="h-3.5 w-3.5 text-[#2EE6D6]" aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  );
}
