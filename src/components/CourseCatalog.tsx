import { ArrowRight, Check, Clock, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import type { Course } from '../data/courses';
import { smoothScrollToId } from '../utils/smoothScroll';

interface CourseCatalogProps {
  course: Course;
}

export default function CourseCatalog({ course }: CourseCatalogProps) {
  return (
    <section id="cursos" className="border-t border-white/[0.08] bg-transparent pb-20 lg:pb-28">
      <div className="mx-auto max-w-[1240px] px-6 sm:px-10 lg:px-14">
        {/* Stage 4a: Open upper viewport zone where brain aligns front-on before shattering into stars */}
        <div
          id="precos-transicao"
          className="pt-16 pb-8 lg:min-h-[82vh] lg:flex lg:flex-col lg:items-center lg:justify-end lg:pt-28 lg:pb-8 lg:text-center"
        >
          <div className="max-w-2xl">
            <p className="font-mono text-xs font-medium tracking-[0.14em] text-[#2EE6D6]">
              FORMAÇÃO PROMPTA · EM BREVE
            </p>
            <h2 className="mt-2.5 font-display text-3xl font-semibold tracking-[-0.025em] text-white sm:text-4xl [text-wrap:balance]">
              Um curso completo do básico ao avançado em Inteligência Artificial
            </h2>
            <p className="mt-2.5 font-mono text-xs text-zinc-300">
              4 fases progressivas · aulas em gravação · inscrições abrem em breve
            </p>
          </div>
        </div>

        {/* Stage 4b: Coming-soon course showcase over the dispersed cosmic starfield */}
        <div id="cursos-conteudo">
          <motion.article
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="glass-surface-featured mt-6 grid grid-cols-1 gap-8 rounded-2xl p-7 lg:grid-cols-12 lg:p-10"
          >
            <div className="flex flex-col justify-between lg:col-span-8">
              <div>
                <div className="flex flex-wrap items-center gap-2 font-mono text-xs text-zinc-200">
                  <Sparkles className="h-3.5 w-3.5 text-[#2EE6D6]" aria-hidden="true" />
                  <span className="font-medium text-[#2EE6D6]">{course.levelLabel}</span>
                  <span aria-hidden="true">·</span>
                  <span>4 fases</span>
                </div>

                <h3 className="mt-3 font-display text-2xl font-semibold tracking-tight text-white sm:text-3xl [text-wrap:balance]">
                  {course.title}
                </h3>

                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-200/90 sm:text-base">
                  {course.subtitle}
                </p>

                <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {course.outcomes.map((outcome) => (
                    <li key={outcome} className="flex items-start gap-2.5 text-xs leading-relaxed text-zinc-100 sm:text-[13px]">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#2EE6D6]" aria-hidden="true" />
                      <span>{outcome}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-7 border-t border-white/[0.1] pt-5">
                <p className="font-mono text-xs text-zinc-300/90">
                  Ferramentas: <span className="text-white">{course.tools.join(' · ')}</span>
                </p>
              </div>
            </div>

            <div className="glass-surface flex flex-col justify-between rounded-2xl p-6 lg:col-span-4">
              <div>
                <p className="font-mono text-[11px] font-medium tracking-[0.12em] text-[#2EE6D6]">
                  STATUS DO CURSO
                </p>
                <div className="mt-4 flex items-center gap-2.5">
                  <Clock className="h-7 w-7 text-[#2EE6D6]" aria-hidden="true" />
                  <span className="font-display text-4xl font-semibold tracking-tight text-white">
                    Em breve
                  </span>
                </div>
                <p className="mt-4 text-xs leading-relaxed text-zinc-300/90">
                  As aulas estão sendo gravadas. Enquanto isso, o primeiro kit da Prompta já está
                  disponível e você começa a criar com IA hoje.
                </p>
              </div>

              <div className="mt-6 flex flex-col gap-3">
                <button
                  type="button"
                  disabled
                  className="inline-flex w-full cursor-not-allowed items-center justify-center rounded-full border border-white/15 bg-white/[0.04] px-5 py-3.5 text-xs font-semibold text-zinc-400"
                >
                  Inscrições em breve
                </button>
                <button
                  type="button"
                  onClick={() => smoothScrollToId('prompts')}
                  className="glass-btn-primary inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-3 text-xs font-semibold text-white transition-all cursor-pointer whitespace-nowrap"
                >
                  <span>Ver o kit disponível</span>
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>
            </div>
          </motion.article>
        </div>
      </div>
    </section>
  );
}
