import { ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { CATALOG_STATS, LEARNING_TRACKS, type CourseLevel } from '../data/courses';

interface CurriculumOverviewProps {
  onSelectTrackFilter: (level: CourseLevel) => void;
}

const TRACK_PALETTES = ['#2EE6D6', '#38BDF8', '#60A5FA', '#818CF8'];

export default function CurriculumOverview({ onSelectTrackFilter }: CurriculumOverviewProps) {
  const trackLevelMap: Record<string, CourseLevel> = {
    '01': 'basico',
    '02': 'intermediario',
    '03': 'avancado',
    '04': 'especializacoes',
  };

  return (
    <section
      id="trilhas"
      className="border-t border-white/[0.08] bg-transparent py-20 lg:min-h-[92vh] lg:flex lg:items-center lg:py-24"
    >
      <div className="mx-auto grid w-full max-w-[1380px] grid-cols-1 items-center gap-8 px-6 sm:px-10 lg:grid-cols-12 lg:px-12">
        {/* Left half reserved strictly for the 180-degree rotated 3D Brain */}
        <div className="hidden lg:block lg:col-span-6 lg:min-h-[520px]" aria-hidden="true" />

        {/* Right half: Quantified proof strip, editorial header, and 4 progressive track cards */}
        <div className="lg:col-span-6 lg:pl-4">
          <div className="glass-surface grid grid-cols-2 divide-y divide-white/[0.08] overflow-hidden rounded-2xl sm:grid-cols-4 sm:divide-y-0 sm:divide-x">
            {CATALOG_STATS.map((stat) => (
              <div key={stat.label} className="p-4 lg:p-5">
                <div className="font-display text-2xl font-semibold tracking-tight text-white tabular-nums lg:text-[1.65rem]">
                  {stat.value}
                </div>
                <div className="mt-1 text-xs font-semibold text-zinc-100">{stat.label}</div>
                <p className="mt-1 text-[11px] leading-snug text-zinc-300/80">{stat.detail}</p>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <p className="font-mono text-xs font-medium tracking-[0.14em] text-[#2EE6D6]">
              CURSO DE IA · EM BREVE
            </p>
            <h2 className="mt-2.5 font-display text-2xl font-semibold tracking-[-0.025em] text-white sm:text-3xl lg:text-[2.15rem] lg:leading-[1.12] [text-wrap:balance]">
              Um curso completo, em 4 fases do básico ao avançado, está a caminho
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-zinc-300/85">
              Sem dezenas de cursos soltos: você começa do zero e evolui passo a passo até usar a IA
              com confiança nos estudos, no trabalho e em casa. Estamos gravando as aulas.
            </p>
          </div>

          <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {LEARNING_TRACKS.map((track, idx) => {
              const targetLevel = trackLevelMap[track.index] || 'basico';
              const accentHex = TRACK_PALETTES[idx % TRACK_PALETTES.length];
              return (
                <motion.article
                  key={track.index}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.45, delay: idx * 0.05, ease: [0.16, 1, 0.3, 1] }}
                  className="glass-surface group flex flex-col justify-between rounded-2xl p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#38BDF8]/35"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 text-[11px] text-zinc-300">
                      <span className="font-mono font-medium" style={{ color: accentHex }}>
                        {track.index}. {track.levelLabel}
                      </span>
                      <span className="font-mono tabular-nums text-zinc-400">
                        Em breve
                      </span>
                    </div>

                    <h3 className="mt-2.5 font-display text-base font-semibold tracking-tight text-white lg:text-lg">
                      {track.title}
                    </h3>

                    <p className="mt-2 text-xs leading-relaxed text-zinc-300/85 sm:text-[13px]">
                      {track.description}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-white/[0.08] pt-3.5">
                    <button
                      type="button"
                      onClick={() => onSelectTrackFilter(targetLevel)}
                      className="glass-btn-secondary inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-xs font-semibold tracking-wide text-white transition-all cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2EE6D6]"
                    >
                      <span>Ver o curso</span>
                      <ArrowRight className="h-3.5 w-3.5 text-[#2EE6D6]" aria-hidden="true" />
                    </button>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
