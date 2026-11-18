import { ArrowRight, Clock } from 'lucide-react';
import { motion } from 'motion/react';
import type { MouseEvent } from 'react';
import { PROMPT_PACKS } from '../data/prompts';
import { formatBRL } from '../utils/checkout';

const PREVIEW_IMAGES: Record<string, string> = {
  'kit-prompo-constroe': 'media/vo-prompo.jpg',
};

export default function PromptsMarketplace() {
  const handleCardPointerMove = (e: MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const xPct = ((e.clientX - rect.left) / Math.max(1, rect.width)) * 100;
    const yPct = ((e.clientY - rect.top) / Math.max(1, rect.height)) * 100;
    e.currentTarget.style.setProperty('--mx', `${xPct.toFixed(1)}%`);
    e.currentTarget.style.setProperty('--my', `${yPct.toFixed(1)}%`);
  };

  return (
    <section
      id="prompts"
      className="relative scroll-mt-20 border-t border-red-500/15 bg-transparent py-20 lg:py-28"
    >
      <div className="mx-auto max-w-[1240px] px-6 sm:px-10 lg:px-14">
        <div className="max-w-3xl">
          <p className="font-mono text-xs font-medium tracking-[0.16em] text-red-400">
            ÁREA DE PROMPTS · ENTREGA PELA KIWIFY
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-[-0.025em] text-white sm:text-4xl lg:text-[2.65rem] lg:leading-[1.08] [text-wrap:balance]">
            Prompts prontos para projetos específicos
          </h2>
          <p className="mt-3.5 max-w-2xl text-sm leading-relaxed text-zinc-300/90 sm:text-base">
            Uma área separada do curso, com kits de prompts prontos para usar com IA, cada um focado
            em um tipo de projeto. O primeiro já está disponível e novos kits chegam em breve.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6">
          {PROMPT_PACKS.map((pack) => (
            <motion.article
              key={pack.id}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              onMouseMove={handleCardPointerMove}
              className="glass-surface-crimson group relative grid grid-cols-1 items-stretch overflow-hidden rounded-2xl transition-all duration-200 hover:-translate-y-1 hover:border-red-300/45 md:grid-cols-2"
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                style={{
                  background:
                    'radial-gradient(380px circle at var(--mx, 60%) var(--my, 45%), rgba(248, 113, 113, 0.14), transparent 65%)',
                }}
              />

              <a
                href={pack.href}
                aria-label={`Ver a página do ${pack.title}`}
                className="relative min-h-[320px] w-full overflow-hidden bg-gradient-to-br from-red-950/70 via-[#15070c] to-[#050307] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-red-400"
              >
                <img
                  src={PREVIEW_IMAGES[pack.id]}
                  alt="Vô Prompo, o mascote do Kit Prompo-Constroe, acenando na frente de uma casa"
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover object-[center_40%] transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent"
                />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between px-4 py-3 text-[11px] font-mono text-zinc-200/95">
                  <span>Conheça o Vô Prompo</span>
                  <span className="text-red-300">Ver vídeos</span>
                </div>
              </a>

              <div className="relative z-10 flex flex-col justify-between p-6 lg:p-8">
                <div>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[11px] text-zinc-300/90">
                    <span className="font-medium text-red-300">{pack.categoryLabel}</span>
                    <span aria-hidden="true" className="text-zinc-500">·</span>
                    <span>3 planos</span>
                    <span aria-hidden="true" className="text-zinc-500">·</span>
                    <span>Acesso na hora</span>
                  </div>

                  <h3 className="mt-2.5 font-display text-2xl font-semibold leading-snug tracking-tight text-white [text-wrap:balance] lg:text-3xl">
                    <a href={pack.href} className="hover:text-red-200 transition-colors">
                      {pack.title}
                    </a>
                  </h3>

                  <p className="mt-3 text-sm leading-relaxed text-zinc-300/90">{pack.subtitle}</p>

                  <p className="mt-3 font-mono text-[11px] text-zinc-400">
                    Funciona com: {pack.tools.join(' · ')}
                  </p>
                </div>

                <div className="mt-6 border-t border-white/10 pt-4">
                  <div className="flex items-end justify-between gap-3 tabular-nums">
                    <div>
                      <span className="block text-[11px] leading-none text-zinc-400">A partir de</span>
                      <span className="mt-1 block font-display text-2xl font-semibold leading-none text-white">
                        {formatBRL(pack.fromPriceCents)}
                      </span>
                    </div>
                    <span className="font-mono text-[11px] text-red-300/90 whitespace-nowrap">
                      7 dias de garantia
                    </span>
                  </div>

                  <a
                    href={pack.href}
                    className="glass-btn-crimson mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-full px-4 py-3 text-xs font-semibold text-white transition-all whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
                  >
                    <span>Ver o kit, os vídeos e os planos</span>
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                </div>
              </div>
            </motion.article>
          ))}

          <div className="glass-surface-crimson flex items-center gap-3 rounded-2xl px-6 py-5 text-sm text-zinc-300/90">
            <Clock className="h-4 w-4 shrink-0 text-red-300" aria-hidden="true" />
            <span>Novos kits de prompts em breve.</span>
          </div>
        </div>
      </div>
    </section>
  );
}
