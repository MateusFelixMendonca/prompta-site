import { motion } from 'motion/react';
import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from 'react';
import { KIT_PLANS, type KitPlan } from '../data/prompts';
import { formatBRL } from '../utils/checkout';
import Estrelas from './Estrelas';

const M = '../media/';
const MELHOR = KIT_PLANS.find((p) => p.id === 'melhor')!;

const PASSOS = [
  {
    n: '1',
    titulo: 'Ideia e roteiro',
    texto:
      'Escolha um dos ganchos prontos ou peça ideias novas. O Claude escreve 60 a 90 segundos de narração na fórmula que segura a atenção até o fim.',
  },
  {
    n: '2',
    titulo: 'Voz e cenas 3D',
    texto:
      'Você gera a voz no ElevenLabs e coloca o MP3 na pasta. O Claude monta a obra em corte, sincronizada palavra por palavra com a narração.',
  },
  {
    n: '3',
    titulo: 'Vídeo, capa e legenda',
    texto:
      'Ele confere o vídeo quadro a quadro, coloca os sons e entrega o MP4 vertical, com a capa e a legenda do post prontas.',
  },
];

const ITENS = [
  { e: '🧠', t: 'O cérebro do Claude', d: 'Instruções e receitas que levam o Claude da ideia ao post, pedindo a sua aprovação nos momentos certos.' },
  { e: '🏗️', t: 'Motor 3D detalhado', d: 'Terra em camadas, grama, sombras, câmera que desliza, etiquetas e legenda palavra por palavra no vídeo.' },
  { e: '👷', t: 'O Vô Prompo', d: 'O mascote do kit: capacete amarelo, colete laranja e terninho. No Melhor Kit ele anda, aponta e comemora.' },
  { e: '🎭', t: '6 personagens', d: 'Personagens prontos para variar os vídeos, ou crie o seu com a cor e a roupa que quiser.' },
  { e: '🚜', t: 'Peças de obra', d: 'Casas, prédios, máquinas, estacas, concreto, terra, rocha, estádio, gente e carros, prontos para usar.' },
  { e: '🔊', t: 'Sons e trilha', d: 'Efeitos colocados sozinhos na hora certa. No Melhor Kit, trilha completa com música e volume no padrão das redes.' },
  { e: '💡', t: 'Fórmula + ganchos', d: 'A estrutura de roteiro que prende até o fim e dezenas de ideias de vídeo prontas, separadas por tema.' },
  { e: '🔎', t: 'Conferência automática', d: 'Antes de entregar, o kit confere o vídeo quadro a quadro atrás de falhas, para você não postar nada quebrado.' },
  { e: '📘', t: 'Exemplos e guia', d: 'Projetos de exemplo abertos para estudar e um guia em PDF da instalação até o primeiro post.' },
];

const TEMAS = [
  { img: 'mar-a.jpg', visual: 'Visual de aquário', t: '🌊 Mar em Corte', d: 'O oceano por dentro: navio que afunda, submarino, cardume, recife e bolhas subindo. Com o Dudu Mergulhão.' },
  { img: 'historia-a.jpg', visual: 'Visual de pedra e areia', t: '🏛️ História em Corte', d: 'Monumentos antigos por dentro: pirâmide com câmaras secretas, castelos, catacumbas e o chão em camadas de épocas. Com a Doutora Duna.' },
  { img: 'corpo-1.jpg', visual: 'Visual de massinha', t: '❤️ Corpo em Corte', d: 'O corpo humano por dentro: pele em camadas, sangue no vaso, glóbulo branco contra vírus e osso que cola. Com o Doutor Miúdo.' },
];

const FAQ = [
  { q: 'Preciso saber programar?', r: 'Não. Você só conversa com o Claude em português. Ele escreve e roda tudo; você aprova o roteiro, grava a voz no ElevenLabs e recebe o vídeo pronto.' },
  { q: 'O que eu preciso ter?', r: 'Um computador com Windows ou Mac, a assinatura do Claude Pro (o Claude Code é quem monta os vídeos; o plano grátis não serve) e uma conta no ElevenLabs para a narração.' },
  { q: 'Quanto tempo leva um vídeo?', r: 'A sua parte é rápida: escolher a ideia, aprovar o roteiro e gerar a voz. Depois o computador gera o vídeo sozinho; o tempo de render depende da máquina e da qualidade escolhida.' },
  { q: 'Funciona no Windows?', r: 'Sim. Funciona no Windows e no Mac. Não precisa ser computador gamer.' },
  { q: 'Qual a diferença entre os planos?', r: 'O Básico tem tudo para fazer o vídeo com sons simples. O Melhor Kit adiciona o Vô Prompo animado, a trilha completa, lugares reais e estádios, mais exemplos e os 3 temas de bônus. O Avançado soma 8 videoaulas, vídeo longo e cortes, plano de 30 dias, guia de monetização e a receita para criar o seu próprio tema.' },
  { q: 'Como funcionam os 3 temas de bônus?', r: 'Cada tema vem com personagem, peças 3D, fórmula de roteiro e ganchos próprios. Você pede ao Claude um vídeo do tema e ele usa as peças daquele universo. Estão no Melhor Kit e no Avançado.' },
  { q: 'Os vídeos são meus?', r: 'Sim. Os vídeos que você cria com o kit são seus para postar no seu perfil.' },
  { q: 'Posso mudar o personagem?', r: 'Pode. Dá para trocar cores, roupa e acessórios, ou criar um personagem seu para o canal.' },
  { q: 'Como eu recebo o kit?', r: 'Pela Kiwify. Assim que o pagamento é aprovado, você recebe um e-mail com o acesso à área de membros, onde baixa o kit (e assiste às aulas, no Avançado).' },
  { q: 'O kit recebe atualizações?', r: 'O kit é entregue completo, com tudo pronto para usar no dia da compra. Não depende de atualizações para funcionar.' },
];

const FITA = ['Sem programar', 'Sem editar vídeo', 'Sem mostrar o rosto', 'Vídeo pronto para postar', 'Narração sincronizada', '3 temas de bônus'];

const reais = (c: number) => formatBRL(c).replace(',00', '');

/* Aparece suave quando entra na tela */
function Revelar({ children, atraso = 0, className = '' }: { children: ReactNode; atraso?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, delay: atraso, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* Celular que inclina seguindo o mouse */
function Celular({ children, className = '' }: { children: ReactNode; className?: string }) {
  const mover = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse') return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    e.currentTarget.style.setProperty('--ry', `${(x * 16).toFixed(2)}deg`);
    e.currentTarget.style.setProperty('--rx', `${(-y * 12).toFixed(2)}deg`);
  };
  const sair = (e: PointerEvent<HTMLDivElement>) => {
    e.currentTarget.style.setProperty('--ry', '0deg');
    e.currentTarget.style.setProperty('--rx', '0deg');
  };
  return (
    <div className={`celular ${className}`} onPointerMove={mover} onPointerLeave={sair}>
      {children}
    </div>
  );
}

function Titulo({ rotulo, children, sub }: { rotulo: string; children: ReactNode; sub?: ReactNode }) {
  return (
    <Revelar className="mx-auto max-w-3xl text-center">
      <p className="rotulo">{rotulo}</p>
      <h2 className="titulo mt-3 text-4xl text-[var(--texto)] sm:text-5xl [text-wrap:balance]">{children}</h2>
      {sub && <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-[var(--texto-2)]">{sub}</p>}
    </Revelar>
  );
}

function Item({ f }: { f: string }) {
  if (f.startsWith('Tudo do')) {
    return (
      <li className="flex gap-2.5 font-black text-[var(--amarelo-claro)]">
        <span className="text-[var(--verde)]">✔</span>
        <span>{f}</span>
      </li>
    );
  }
  if (f.startsWith('Bônus')) {
    return (
      <li className="flex gap-2.5 rounded-xl border border-[rgba(255,122,26,0.35)] bg-[rgba(255,122,26,0.12)] px-2.5 py-1.5 font-black text-[#ffb27a]">
        <span>🎁</span>
        <span>{f}</span>
      </li>
    );
  }
  return (
    <li className="flex gap-2.5 text-[var(--texto-2)]">
      <span className="text-[var(--verde)]">✔</span>
      <span>{f}</span>
    </li>
  );
}

function Plano({ plano }: { plano: KitPlan }) {
  const destaque = plano.recommended;
  const avancado = plano.id === 'avancado';
  const economia = plano.listPriceCents ? plano.listPriceCents - plano.priceCents : 0;
  const pct = plano.listPriceCents ? Math.round((economia / plano.listPriceCents) * 100) : 0;
  return (
    <article
      className={`plano flex flex-col p-7 ${destaque ? 'vidro-amarelo plano-destaque' : 'vidro'} ${avancado ? 'plano-avancado' : ''}`}
    >
      {plano.badge && (
        <span
          className={`pilula absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap ${destaque ? 'bg-[var(--amarelo)] text-[var(--noite)]' : 'bg-[#3b5bdb] text-white'}`}
        >
          {plano.badge}
        </span>
      )}
      <h3 className={`titulo text-3xl ${destaque ? 'brilho-amarelo' : 'text-[var(--texto)]'}`}>{plano.name}</h3>
      <p className="mt-1 text-sm text-[var(--texto-3)]">{plano.tagline}</p>
      <div className="mt-5">
        {plano.listPriceCents && (
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <span className="text-lg font-extrabold text-[var(--texto-3)]">
              de <s className="decoration-[var(--vermelho)] decoration-[3px]">{reais(plano.listPriceCents)}</s> por
            </span>
            <span className="rounded-full bg-[var(--vermelho)] px-2.5 py-0.5 text-xs font-black text-white">-{pct}%</span>
          </div>
        )}
        <span className={`titulo text-5xl ${destaque ? 'text-[var(--amarelo)]' : 'text-[var(--texto)]'}`}>{reais(plano.priceCents)}</span>
        <span className="mt-1 block font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--texto-3)]">pagamento único</span>
        {economia > 0 && (
          <span className="mt-2 inline-block rounded-lg bg-[rgba(111,208,74,0.14)] px-2.5 py-1 text-sm font-black text-[var(--verde)]">
            Você economiza {reais(economia)}
          </span>
        )}
      </div>
      <ul className="mt-6 flex-1 space-y-2.5 text-[15px]">
        {plano.features.map((f) => (
          <Item key={f} f={f} />
        ))}
      </ul>
      <a href={plano.checkoutUrl} className={`botao mt-7 w-full ${destaque ? 'pulsar' : 'botao-vidro'}`}>
        {plano.cta}
      </a>
    </article>
  );
}

function Pergunta({ q, r }: { q: string; r: string }) {
  const [aberta, setAberta] = useState(false);
  return (
    <div className={`vidro overflow-hidden transition-colors ${aberta ? 'border-[rgba(255,194,42,0.4)]' : ''}`}>
      <button
        type="button"
        aria-expanded={aberta}
        onClick={() => setAberta((v) => !v)}
        className="flex w-full cursor-pointer items-center justify-between gap-4 px-6 py-5 text-left text-[17px] font-extrabold text-[var(--texto)]"
      >
        <span>{q}</span>
        <span className={`titulo text-2xl text-[var(--amarelo)] transition-transform ${aberta ? 'rotate-45' : ''}`}>+</span>
      </button>
      {aberta && <p className="px-6 pb-5 text-[15px] leading-relaxed text-[var(--texto-2)]">{r}</p>}
    </div>
  );
}

function Video({ nome, titulo, legenda, atraso }: { nome: string; titulo: string; legenda: string; atraso: number }) {
  return (
    <Revelar atraso={atraso}>
      <figure className="mx-auto w-full max-w-[300px]">
        <div className="flutuar" style={{ animationDelay: `${atraso * 3}s` }}>
          <Celular>
            <video controls preload="none" playsInline poster={`${M}${nome}.jpg`} src={`${M}${nome}.mp4`} />
          </Celular>
        </div>
        <figcaption className="mt-7 text-center">
          <span className="titulo block text-2xl text-[var(--texto)]">{titulo}</span>
          <span className="mt-1 block text-sm text-[var(--texto-2)]">{legenda}</span>
        </figcaption>
      </figure>
    </Revelar>
  );
}

export default function KitPage() {
  const [barra, setBarra] = useState(false);
  const leque = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ver = () => {
      const planos = document.getElementById('planos');
      const passou = window.scrollY > 700;
      const nosPlanos = planos
        ? planos.getBoundingClientRect().top < window.innerHeight && planos.getBoundingClientRect().bottom > 0
        : false;
      setBarra(passou && !nosPlanos);
      // o leque de celulares abre conforme a página rola
      const abre = Math.min(1, window.scrollY / 420);
      leque.current?.style.setProperty('--abre', abre.toFixed(3));
    };
    ver();
    window.addEventListener('scroll', ver, { passive: true });
    return () => window.removeEventListener('scroll', ver);
  }, []);

  return (
    <div className="relative min-h-screen">
      <Estrelas />

      {/* Topo */}
      <header className="vidro-nav sticky top-0 z-40">
        <div className="mx-auto flex max-w-[1180px] items-center justify-between gap-3 px-4 py-3 sm:px-8">
          <a href="../" className="flex items-center gap-2.5 no-underline">
            <img src={`${M}vo-prompo.jpg`} alt="" className="h-9 w-9 rounded-full border-2 border-[var(--amarelo)] object-cover object-top sm:h-10 sm:w-10" />
            <span className="titulo whitespace-nowrap text-[17px] text-[var(--texto)] sm:text-2xl">
              Prompo<span className="text-[var(--amarelo)]">-Constroe</span>
            </span>
          </a>
          <div className="flex items-center gap-2 sm:gap-3">
            <a href="../" className="voltar px-3.5 py-2 text-base sm:px-4" aria-label="Voltar para a home da Prompta">
              <span aria-hidden="true">←</span>
              <span className="hidden sm:inline"> Voltar para a Home</span>
            </a>
            <a href="#planos" className="botao whitespace-nowrap px-3.5 py-2 text-sm sm:px-5 sm:py-2.5 sm:text-base">
              Quero o kit
            </a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto grid max-w-[1180px] grid-cols-1 items-center gap-14 px-5 pb-24 pt-12 sm:px-8 lg:grid-cols-2 lg:pt-16">
        <Revelar>
          <p className="rotulo">Kit de prompts · 01 · Claude Code</p>
          <h1 className="titulo mt-4 text-[44px] text-[var(--texto)] sm:text-6xl lg:text-[68px]">
            Vídeos 3D de obra em corte que <span className="brilho-amarelo">prendem</span> até o fim.
          </h1>
          <p className="mt-5 max-w-[34rem] text-lg leading-relaxed text-[var(--texto-2)]">
            Você <strong className="text-[var(--amarelo-claro)]">conversa com o Claude</strong> e o Vô Prompo constrói. Roteiro, cenas em 3D, narração sincronizada, sons, capa e legenda saem{' '}
            <span className="marca font-black">prontos para postar</span>.
          </p>
          <ul className="mt-6 flex flex-wrap gap-2.5">
            {['Sem programar', 'Sem editar vídeo', 'Sem mostrar o rosto'].map((t) => (
              <li key={t} className="chip">
                <span className="text-[var(--verde)]">✔</span> {t}
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <a href="#planos" className="botao pulsar text-[22px]">Quero meu kit agora</a>
            <a href="#videos" className="voltar px-5 py-3.5 text-base">▶ Ver os vídeos</a>
          </div>
          <p className="mt-5 text-[15px] font-extrabold text-[var(--texto)]">
            🔥 Melhor Kit de <s className="text-[var(--texto-3)] decoration-[var(--vermelho)] decoration-2">{reais(MELHOR.listPriceCents!)}</s>{' '}
            por <span className="text-lg text-[var(--amarelo)]">{reais(MELHOR.priceCents)}</span>
          </p>
          <p className="mt-2 font-mono text-xs tracking-wide text-[var(--texto-3)]">
            7 dias de garantia · acesso na hora · 3 temas de bônus
          </p>
        </Revelar>

        <div ref={leque} className="leque">
          <div aria-hidden="true" className="holofote pointer-events-none absolute -inset-16" />
          <div className="leque-item leque-esq">
            <div className="flutuar" style={{ animationDelay: '-2s' }}>
              <Celular>
                <video autoPlay muted loop playsInline poster={`${M}046c.jpg`} src={`${M}046c.mp4`} aria-hidden="true" />
              </Celular>
            </div>
          </div>
          <div className="leque-item leque-dir">
            <div className="flutuar" style={{ animationDelay: '-4s' }}>
              <Celular>
                <img src={`${M}mar-a.jpg`} alt="" aria-hidden="true" />
              </Celular>
            </div>
          </div>
          <div className="leque-item leque-centro">
            <div className="flutuar">
              <Celular>
                <video autoPlay muted loop playsInline poster={`${M}032c.jpg`} src={`${M}032c.mp4`} aria-label="Trecho de um vídeo feito com o kit: prédio em corte durante um terremoto" />
              </Celular>
            </div>
          </div>
          <div className="balancar absolute -right-2 top-[8%] z-10 rounded-2xl bg-[var(--laranja)] px-3.5 py-2.5 text-center text-white shadow-[0_10px_30px_-8px_rgba(255,122,26,0.7)] sm:-right-8">
            <span className="titulo block text-2xl leading-none">+3 temas</span>
            <span className="text-xs font-extrabold">de bônus 🎁</span>
          </div>
          <div className="absolute -left-2 bottom-[4%] z-10 flex items-center gap-2.5 rounded-full border border-[rgba(255,194,42,0.4)] bg-[rgba(4,6,13,0.85)] py-1.5 pl-1.5 pr-4 shadow-xl sm:-left-6">
            <img src={`${M}vo-prompo.jpg`} alt="Vô Prompo, o mascote do kit" className="h-12 w-12 rounded-full border-2 border-[var(--amarelo)] object-cover object-top" />
            <span className="leading-tight">
              <span className="block text-sm font-black text-[var(--texto)]">Vô Prompo</span>
              <span className="block font-mono text-[11px] text-[var(--amarelo)]">mestre de obras</span>
            </span>
          </div>
        </div>
      </section>

      {/* Fita de obra */}
      <div className="fita -rotate-1 py-3" aria-hidden="true">
        <div className="fita-trilho">
          {[0, 1].map((k) => (
            <div key={k} className="flex shrink-0 items-center">
              {FITA.map((t) => (
                <span key={t} className="titulo whitespace-nowrap px-6 text-xl uppercase">
                  {t} <span className="pl-6">✦</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Feito com o kit */}
      <section id="videos" className="scroll-mt-20 py-24">
        <div className="mx-auto max-w-[1180px] px-5 sm:px-8">
          <Titulo
            rotulo="Feito com o kit"
            sub={
              <>
                Você vê <span className="marca font-black">tudo o que acontece embaixo do chão</span> e dentro da obra, em escala, com o jeitão de brinquedo do Vô Prompo.{' '}
                <strong className="text-[var(--amarelo)]">Aperte o play e ouça com som.</strong>
              </>
            }
          >
            A terra <span className="brilho-amarelo">cortada ao meio</span>
          </Titulo>
          <div className="mt-14 grid grid-cols-1 gap-14 sm:grid-cols-2">
            <Video nome="032" titulo="O prédio que não cai" legenda="Estacas, isolador de borracha e uma bola de aço no topo" atraso={0} />
            <Video nome="046" titulo="A Arena Castelão por dentro" legenda="Lugares reais e estádios, no Melhor Kit" atraso={0.15} />
          </div>
          <Revelar>
            <p className="mx-auto mt-14 max-w-xl text-center text-sm text-[var(--texto-3)]">
              Tudo isso foi feito <strong className="text-[var(--texto)]">só conversando com o Claude</strong>, com este kit. Nenhum programa de edição, nenhuma linha de código escrita à mão.
            </p>
          </Revelar>
        </div>
      </section>

      {/* Como funciona */}
      <section className="py-24">
        <div className="mx-auto max-w-[1180px] px-5 sm:px-8">
          <Titulo
            rotulo="Como funciona"
            sub={
              <>
                O kit é uma pasta que você abre no Claude. Ele segue a linha de montagem e <span className="marca font-black">você só aprova</span>.
              </>
            }
          >
            Da ideia ao vídeo pronto, <span className="brilho-amarelo">conversando</span>
          </Titulo>
          <div className="relative mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
            <div aria-hidden="true" className="tracejado absolute left-[16%] right-[16%] top-[52px] hidden h-[2px] md:block" />
            {PASSOS.map((p, i) => (
              <Revelar key={p.n} atraso={i * 0.12}>
                <article className="vidro relative h-full p-7">
                  <span className="titulo relative flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--amarelo)] text-3xl text-[var(--noite)] shadow-[0_0_30px_-4px_rgba(255,194,42,0.6)]">
                    {p.n}
                  </span>
                  <h3 className="titulo mt-5 text-2xl text-[var(--texto)]">{p.titulo}</h3>
                  <p className="mt-2.5 text-[15px] leading-relaxed text-[var(--texto-2)]">{p.texto}</p>
                </article>
              </Revelar>
            ))}
          </div>
        </div>
      </section>

      {/* O que vem no kit */}
      <section className="py-24">
        <div className="mx-auto max-w-[1180px] px-5 sm:px-8">
          <Titulo rotulo="O que vem no kit" sub={<>Tudo pronto para abrir no Claude e <strong className="text-[var(--amarelo)]">começar hoje</strong>.</>}>
            Uma construtora inteira <span className="brilho-amarelo">numa pasta</span>
          </Titulo>
          <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {ITENS.map((i, k) => (
              <Revelar key={i.t} atraso={(k % 3) * 0.08}>
                <article className="vidro group h-full p-6 transition-[border-color,transform] duration-200 hover:-translate-y-1 hover:border-[rgba(255,194,42,0.4)]">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-[rgba(255,194,42,0.3)] bg-[rgba(255,194,42,0.1)] text-2xl" aria-hidden="true">
                    {i.e}
                  </span>
                  <h3 className="titulo mt-4 text-xl text-[var(--amarelo-claro)]">{i.t}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-[var(--texto-2)]">{i.d}</p>
                </article>
              </Revelar>
            ))}
          </div>
        </div>
      </section>

      {/* Bônus */}
      <section className="py-24">
        <div className="mx-auto max-w-[1180px] px-5 sm:px-8">
          <Titulo
            rotulo="🎁 Bônus no Melhor Kit e no Avançado"
            sub="Cada tema tem o próprio personagem, o próprio visual e o mesmo jeito fácil de fazer vídeo que você já vai conhecer."
          >
            Mais <span className="text-[var(--laranja)]">3 temas</span>, <span className="brilho-amarelo">3 canais novos</span>
          </Titulo>
          <div className="mt-14 grid grid-cols-1 gap-10 md:grid-cols-3">
            {TEMAS.map((t, k) => (
              <Revelar key={t.t} atraso={k * 0.12}>
                <article className="text-center">
                  <div className="flutuar mx-auto w-[62%] max-w-[230px]" style={{ animationDelay: `${-k * 1.6}s` }}>
                    <Celular>
                      <img src={`${M}${t.img}`} alt={t.t} loading="lazy" />
                    </Celular>
                  </div>
                  <p className="rotulo mt-7">{t.visual}</p>
                  <h3 className="titulo mt-1.5 text-2xl text-[var(--texto)]">{t.t}</h3>
                  <p className="mx-auto mt-2 max-w-xs text-[15px] leading-relaxed text-[var(--texto-2)]">{t.d}</p>
                </article>
              </Revelar>
            ))}
          </div>
          <Revelar>
            <p className="mx-auto mt-12 max-w-2xl text-center text-sm text-[var(--texto-3)]">
              Cada tema traz peças 3D, personagem, fórmula do roteiro e 30 ideias de gancho.
            </p>
          </Revelar>
        </div>
      </section>

      {/* Você vai precisar */}
      <section className="py-24">
        <div className="mx-auto max-w-[1180px] px-5 sm:px-8">
          <Titulo rotulo="Você vai precisar">
            Só <span className="brilho-amarelo">três coisas</span>
          </Titulo>
          <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              { e: '🤖', t: 'Claude Pro', d: 'O Claude Code é quem monta os vídeos. O plano grátis não serve. A partir de US$ 20 por mês.' },
              { e: '🎙️', t: 'ElevenLabs', d: 'Para a voz da narração. Dá para testar de graça antes de assinar.' },
              { e: '💻', t: 'Um computador', d: 'Windows ou Mac. Não precisa ser computador gamer.' },
            ].map((c, k) => (
              <Revelar key={c.t} atraso={k * 0.1}>
                <article className="vidro h-full p-7 text-center">
                  <span className="text-4xl" aria-hidden="true">{c.e}</span>
                  <h3 className="titulo mt-3 text-2xl text-[var(--texto)]">{c.t}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-[var(--texto-2)]">{c.d}</p>
                </article>
              </Revelar>
            ))}
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
            <Revelar>
              <article className="vidro h-full border-[rgba(111,208,74,0.3)] p-7">
                <h3 className="titulo text-2xl text-[var(--verde)]">É para você se…</h3>
                <ul className="mt-4 space-y-2.5 text-[15px] text-[var(--texto-2)]">
                  {['Quer um perfil de vídeos curtos sem aparecer', 'Não sabe programar nem editar vídeo', 'Gosta de obra, engenharia, estádios, mar, história ou corpo humano', 'Quer postar com constância, 3 a 5 vídeos por semana'].map((t) => (
                    <li key={t} className="flex gap-2.5">
                      <span className="text-[var(--verde)]">✔</span>
                      {t}
                    </li>
                  ))}
                </ul>
              </article>
            </Revelar>
            <Revelar atraso={0.1}>
              <article className="vidro h-full border-[rgba(255,107,91,0.3)] p-7">
                <h3 className="titulo text-2xl text-[var(--vermelho)]">Não é para você se…</h3>
                <ul className="mt-4 space-y-2.5 text-[15px] text-[var(--texto-2)]">
                  {['Procura dinheiro rápido sem postar', 'Não vai assinar o Claude Pro', 'Quer vídeos realistas de cinema', 'Só usa celular (precisa de computador)'].map((t) => (
                    <li key={t} className="flex gap-2.5">
                      <span className="text-[var(--vermelho)]">✖</span>
                      {t}
                    </li>
                  ))}
                </ul>
              </article>
            </Revelar>
          </div>
        </div>
      </section>

      {/* Planos */}
      <section id="planos" className="relative scroll-mt-16 py-24">
        <div aria-hidden="true" className="holofote pointer-events-none absolute inset-0" />
        <div className="relative mx-auto max-w-[1180px] px-5 sm:px-8">
          <Titulo rotulo="Escolha o seu plano" sub={<><strong className="text-[var(--texto)]">Pagamento único.</strong> Sem mensalidade do kit.</>}>
            Comece a postar <span className="brilho-amarelo">hoje</span>
          </Titulo>
          <Revelar className="mt-6 text-center">
            <div className="vidro-amarelo inline-flex flex-wrap items-center justify-center gap-x-2 gap-y-1 px-5 py-3">
              <span className="font-black text-[var(--texto)]">🔥 Preço de lançamento:</span>
              <span className="text-[var(--texto-2)]">
                Melhor Kit de <s className="decoration-[var(--vermelho)] decoration-2">{reais(MELHOR.listPriceCents!)}</s> por
              </span>
              <span className="titulo text-2xl text-[var(--amarelo)]">{reais(MELHOR.priceCents)}</span>
            </div>
          </Revelar>
          <div className="planos-grade mt-16 grid grid-cols-1 gap-10 lg:grid-cols-3 lg:items-start lg:gap-8">
            {KIT_PLANS.map((p) => (
              <Plano key={p.id} plano={p} />
            ))}
          </div>

          <Revelar>
            <div className="vidro mx-auto mt-14 flex max-w-3xl flex-col items-center gap-5 p-7 text-center sm:flex-row sm:text-left">
              <div className="flex h-24 w-24 shrink-0 flex-col items-center justify-center rounded-full border-2 border-[var(--amarelo)] text-[var(--amarelo)] shadow-[0_0_30px_-6px_rgba(255,194,42,0.6)]">
                <span className="titulo text-4xl leading-none">7</span>
                <span className="text-[11px] font-black uppercase">dias</span>
              </div>
              <p className="text-[16px] leading-relaxed text-[var(--texto-2)]">
                <strong className="titulo text-xl text-[var(--texto)]">
                  Garantia de <span className="text-[var(--amarelo)]">7 dias</span> em todos os planos.
                </strong>
                <br />
                Se não gostar, peça o reembolso pela Kiwify dentro de 7 dias e <span className="marca font-black">receba o valor de volta</span>. O risco é zero.
              </p>
            </div>
          </Revelar>
        </div>
      </section>

      {/* Dúvidas */}
      <section className="py-24">
        <div className="mx-auto max-w-[820px] px-5 sm:px-8">
          <Titulo rotulo="Dúvidas">Perguntas frequentes</Titulo>
          <div className="mt-10 space-y-3.5">
            {FAQ.map((f) => (
              <Pergunta key={f.q} q={f.q} r={f.r} />
            ))}
          </div>
        </div>
      </section>

      {/* Chamada final */}
      <section className="pt-16">
        <Revelar className="mx-auto flex max-w-[1180px] flex-col items-center gap-10 px-5 text-center sm:px-8 lg:flex-row lg:text-left">
          <div className="flutuar shrink-0">
            <img
              src={`${M}vo-prompo-festa.jpg`}
              alt="Vô Prompo comemorando"
              loading="lazy"
              className="w-56 rounded-[28px] border-2 border-[var(--amarelo)] shadow-[0_0_70px_-10px_rgba(255,194,42,0.55)]"
            />
          </div>
          <div>
            <h2 className="titulo text-4xl text-[var(--texto)] sm:text-5xl">
              O Vô Prompo já está de capacete. <span className="brilho-amarelo">Bora construir?</span>
            </h2>
            <p className="mt-4 max-w-xl text-lg text-[var(--texto-2)]">
              Comece hoje com o <strong className="text-[var(--texto)]">Melhor Kit por {reais(MELHOR.priceCents)}</strong> (de{' '}
              <s className="decoration-[var(--vermelho)] decoration-2">{reais(MELHOR.listPriceCents!)}</s>) e leve mais{' '}
              <strong className="text-[var(--amarelo)]">3 temas de bônus</strong>. Se não gostar, 7 dias de garantia.
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-4 lg:justify-start">
              <a href="#planos" className="botao pulsar text-[22px]">Quero meu kit agora</a>
              <a href="../" className="voltar px-4 py-3 text-base">
                <span aria-hidden="true">←</span> Voltar para a Home
              </a>
            </div>
          </div>
        </Revelar>
        <footer className="mt-20">
          <div className="fita h-4" aria-hidden="true" />
          <div className="bg-[var(--noite)] pb-24 pt-6 text-center font-mono text-xs text-[var(--texto-3)] sm:pb-8">
            © 2026 <a href="../" className="text-[var(--amarelo)] underline">Prompta</a> · Kit Prompo-Constroe · Pagamentos pela Kiwify
          </div>
        </footer>
      </section>

      {/* Barra fixa no celular */}
      <div
        className={`vidro-nav fixed inset-x-0 bottom-0 z-50 border-t border-[rgba(255,194,42,0.3)] px-4 py-3 transition-transform duration-300 sm:hidden ${barra ? 'translate-y-0' : 'translate-y-full'}`}
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <span className="block text-xs font-extrabold text-[var(--texto-3)]">
              {MELHOR.name} · de <s className="decoration-[var(--vermelho)] decoration-2">{reais(MELHOR.listPriceCents!)}</s>
            </span>
            <span className="titulo text-2xl text-[var(--amarelo)]">{reais(MELHOR.priceCents)}</span>
          </div>
          <a href="#planos" className="botao px-5 py-3 text-lg">Quero o kit</a>
        </div>
      </div>
    </div>
  );
}
