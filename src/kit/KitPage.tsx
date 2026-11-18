import { useEffect, useState } from 'react';
import { KIT_PLANS, type KitPlan } from '../data/prompts';
import { formatBRL } from '../utils/checkout';

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
  { img: 'mar-a.jpg', visual: 'VISUAL DE AQUÁRIO', t: '🌊 Mar em Corte', d: 'O oceano por dentro: navio que afunda, submarino, cardume, recife e bolhas subindo. Com o Dudu Mergulhão.' },
  { img: 'historia-a.jpg', visual: 'VISUAL DE PEDRA E AREIA', t: '🏛️ História em Corte', d: 'Monumentos antigos por dentro: pirâmide com câmaras secretas, castelos, catacumbas e o chão em camadas de épocas. Com a Doutora Duna.' },
  { img: 'corpo-1.jpg', visual: 'VISUAL DE MASSINHA', t: '❤️ Corpo em Corte', d: 'O corpo humano por dentro: pele em camadas, sangue no vaso, glóbulo branco contra vírus e osso que cola. Com o Doutor Miúdo.' },
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

function Plano({ plano }: { plano: KitPlan }) {
  const destaque = plano.recommended;
  return (
    <article
      className={`cartao relative flex flex-col p-7 ${destaque ? 'ring-4 ring-[var(--laranja)] lg:-translate-y-3' : ''}`}
    >
      {destaque && (
        <span className="pilula absolute -top-4 left-1/2 -translate-x-1/2 bg-[var(--laranja)] text-white whitespace-nowrap">
          ⭐ Mais escolhido
        </span>
      )}
      <h3 className="titulo text-3xl text-[var(--marinho)]">{plano.name}</h3>
      <p className="mt-1 text-sm text-[#6b5646]">{plano.tagline}</p>
      <div className="mt-5">
        <span className="titulo text-5xl text-[var(--tinta)]">{formatBRL(plano.priceCents).replace(',00', '')}</span>
        <span className="mt-1 block text-xs font-extrabold uppercase tracking-wider text-[#6b5646]">pagamento único</span>
      </div>
      <ul className="mt-6 flex-1 space-y-2.5 text-[15px]">
        {plano.features.map((f) => (
          <li key={f} className="flex gap-2.5">
            <span className="text-[var(--verde)]">✔</span>
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <a href={plano.checkoutUrl} className={`botao mt-7 w-full ${destaque ? '' : 'botao-marinho'}`}>
        {plano.cta}
      </a>
    </article>
  );
}

function Pergunta({ q, r }: { q: string; r: string }) {
  const [aberta, setAberta] = useState(false);
  return (
    <div className="cartao overflow-hidden">
      <button
        type="button"
        aria-expanded={aberta}
        onClick={() => setAberta((v) => !v)}
        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left text-[17px] font-extrabold text-[var(--marinho)] cursor-pointer"
      >
        <span>{q}</span>
        <span className={`titulo text-2xl text-[var(--laranja)] transition-transform ${aberta ? 'rotate-45' : ''}`}>+</span>
      </button>
      {aberta && <p className="px-6 pb-5 text-[15px] leading-relaxed text-[#4a3a2c]">{r}</p>}
    </div>
  );
}

function Video({ nome, titulo, legenda }: { nome: string; titulo: string; legenda: string }) {
  return (
    <figure className="mx-auto w-full max-w-[300px]">
      <div className="celular">
        <video controls preload="none" playsInline poster={`${M}${nome}.jpg`} src={`${M}${nome}.mp4`} />
      </div>
      <figcaption className="mt-5 text-center">
        <span className="titulo block text-2xl text-[var(--marinho)]">{titulo}</span>
        <span className="mt-1 block text-sm text-[#4a3a2c]">{legenda}</span>
      </figcaption>
    </figure>
  );
}

export default function KitPage() {
  const [barra, setBarra] = useState(false);

  useEffect(() => {
    const ver = () => {
      const planos = document.getElementById('planos');
      const passou = window.scrollY > 700;
      const nosPlanos = planos
        ? planos.getBoundingClientRect().top < window.innerHeight && planos.getBoundingClientRect().bottom > 0
        : false;
      setBarra(passou && !nosPlanos);
    };
    ver();
    window.addEventListener('scroll', ver, { passive: true });
    return () => window.removeEventListener('scroll', ver);
  }, []);

  return (
    <div className="min-h-screen">
      {/* Topo */}
      <header className="mx-auto flex max-w-[1180px] items-center justify-between gap-3 px-4 py-4 sm:px-5 sm:py-5 sm:px-8">
        <a href="../" className="flex items-center gap-2.5 no-underline">
          <img src={`${M}vo-prompo.jpg`} alt="" className="h-9 w-9 sm:h-11 sm:w-11 rounded-full border-[3px] border-white object-cover object-top shadow" />
          <span className="titulo whitespace-nowrap text-[17px] text-[var(--marinho)] sm:text-2xl">
            Prompo<span className="text-[var(--laranja)]">-Constroe</span>
          </span>
        </a>
        <a href="#planos" className="botao whitespace-nowrap px-3.5 py-2 text-sm sm:px-5 sm:py-2.5 sm:text-base">Quero o kit</a>
      </header>

      {/* Hero */}
      <section className="mx-auto grid max-w-[1180px] grid-cols-1 items-center gap-12 px-5 pb-20 pt-6 sm:px-8 lg:grid-cols-2 lg:pt-10">
        <div>
          <span className="pilula bg-[var(--marinho)] text-white">Kit para Claude Code</span>
          <h1 className="titulo mt-5 text-[44px] text-[var(--tinta)] sm:text-6xl lg:text-[68px]">
            Vídeos 3D de obra em corte que <span className="text-[var(--laranja)]">prendem</span> até o fim.
          </h1>
          <p className="mt-5 max-w-[34rem] text-lg leading-relaxed text-[#3a2a1c]">
            Você conversa com o Claude e o Vô Prompo constrói. Roteiro, cenas em 3D, narração sincronizada, sons, capa e legenda saem prontos para postar.
          </p>
          <ul className="mt-6 flex flex-wrap gap-2.5">
            {['Sem programar', 'Sem editar vídeo', 'Sem mostrar o rosto'].map((t) => (
              <li key={t} className="rounded-full bg-white px-4 py-2 text-sm font-extrabold text-[var(--marinho)] shadow-[0_3px_0_rgba(36,23,13,0.12)]">
                <span className="text-[var(--verde)]">✔</span> {t}
              </li>
            ))}
          </ul>
          <a href="#planos" className="botao mt-8 text-[22px]">Quero meu kit agora</a>
          <p className="mt-4 text-sm font-extrabold text-[#5a4634]">
            🛡️ 7 dias de garantia · acesso na hora · 🎁 3 temas de bônus
          </p>
        </div>

        <div className="relative mx-auto w-full max-w-[330px]">
          <div className="celular">
            <video autoPlay muted loop playsInline poster={`${M}032c.jpg`} src={`${M}032c.mp4`} aria-label="Trecho de um vídeo feito com o kit: prédio em corte durante um terremoto" />
          </div>
          <div className="balancar absolute -right-6 top-10 rounded-2xl bg-[var(--laranja)] px-3.5 py-2.5 text-center text-white shadow-lg sm:-right-12">
            <span className="titulo block text-2xl leading-none">+3 temas</span>
            <span className="text-xs font-extrabold">de bônus 🎁</span>
          </div>
          <img
            src={`${M}vo-prompo.jpg`}
            alt="Vô Prompo, o mascote do kit"
            className="absolute -bottom-8 -left-8 h-28 w-28 rounded-full border-[5px] border-white object-cover object-top shadow-xl sm:-left-14 sm:h-32 sm:w-32"
          />
        </div>
      </section>

      {/* Feito com o kit */}
      <section className="bg-[var(--creme)] py-20">
        <div className="mx-auto max-w-[1180px] px-5 sm:px-8">
          <div className="text-center">
            <span className="pilula bg-[var(--amarelo)] text-[var(--tinta)]">Feito com o kit</span>
            <h2 className="titulo mt-4 text-4xl text-[var(--marinho)] sm:text-5xl">A terra cortada ao meio</h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-[#4a3a2c]">
              Você vê tudo o que acontece embaixo do chão e dentro da obra, em escala, com o jeitão de brinquedo do Vô Prompo. Aperte o play e ouça com som.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-12 sm:grid-cols-2">
            <Video nome="032" titulo="O prédio que não cai" legenda="Estacas, isolador de borracha e uma bola de aço no topo" />
            <Video nome="046" titulo="A Arena Castelão por dentro" legenda="Lugares reais e estádios, no Melhor Kit" />
          </div>
          <p className="mx-auto mt-12 max-w-xl text-center text-sm text-[#6b5646]">
            Tudo isso foi feito só conversando com o Claude, com este kit. Nenhum programa de edição, nenhuma linha de código escrita à mão.
          </p>
        </div>
      </section>

      {/* Como funciona */}
      <section className="bg-[var(--creme)] pb-24">
        <div className="mx-auto max-w-[1180px] px-5 sm:px-8">
          <div className="text-center">
            <span className="pilula bg-[var(--marinho)] text-white">Como funciona</span>
            <h2 className="titulo mt-4 text-4xl text-[var(--marinho)] sm:text-5xl">Da ideia ao vídeo pronto, conversando</h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-[#4a3a2c]">
              O kit é uma pasta que você abre no Claude. Ele segue a linha de montagem e você só aprova.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            {PASSOS.map((p) => (
              <article key={p.n} className="cartao p-7">
                <span className="titulo flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--amarelo)] text-2xl">{p.n}</span>
                <h3 className="titulo mt-5 text-2xl text-[var(--marinho)]">{p.titulo}</h3>
                <p className="mt-2.5 text-[15px] leading-relaxed text-[#4a3a2c]">{p.texto}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* O que vem no kit */}
      <section className="bg-[var(--marinho)] py-24 text-white">
        <div className="mx-auto max-w-[1180px] px-5 sm:px-8">
          <div className="text-center">
            <span className="pilula bg-[var(--amarelo)] text-[var(--tinta)]">O que vem no kit</span>
            <h2 className="titulo mt-4 text-4xl sm:text-5xl">Uma construtora inteira numa pasta</h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-white/80">Tudo pronto para abrir no Claude e começar hoje.</p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {ITENS.map((i) => (
              <article key={i.t} className="rounded-[22px] border border-white/15 bg-white/[0.07] p-6">
                <span className="text-3xl" aria-hidden="true">{i.e}</span>
                <h3 className="titulo mt-3 text-xl">{i.t}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-white/80">{i.d}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Bônus */}
      <section className="bg-[var(--marinho-escuro)] py-24 text-white">
        <div className="mx-auto max-w-[1180px] px-5 sm:px-8">
          <div className="text-center">
            <span className="pilula bg-[var(--laranja)] text-white">🎁 Bônus</span>
            <h2 className="titulo mt-4 text-4xl sm:text-5xl">Mais 3 temas, 3 canais novos</h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-white/80">
              Cada tema tem o próprio personagem, o próprio visual e o mesmo jeito fácil de fazer vídeo que você já vai conhecer.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            {TEMAS.map((t) => (
              <article key={t.t} className="overflow-hidden rounded-[22px] bg-white text-[var(--tinta)]">
                <img src={`${M}${t.img}`} alt={t.t} loading="lazy" className="h-56 w-full object-cover" />
                <div className="p-6">
                  <span className="text-xs font-black tracking-[1.4px] text-[var(--laranja)]">{t.visual}</span>
                  <h3 className="titulo mt-1.5 text-2xl text-[var(--marinho)]">{t.t}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-[#4a3a2c]">{t.d}</p>
                </div>
              </article>
            ))}
          </div>
          <p className="mx-auto mt-10 max-w-2xl text-center text-sm text-white/70">
            Vem no Melhor Kit e no Avançado. Cada tema traz peças 3D, personagem, fórmula do roteiro e 30 ideias de gancho.
          </p>
        </div>
      </section>

      {/* Você vai precisar */}
      <section className="bg-[var(--creme)] py-24">
        <div className="mx-auto max-w-[1180px] px-5 sm:px-8">
          <div className="text-center">
            <span className="pilula bg-[var(--amarelo)] text-[var(--tinta)]">Você vai precisar</span>
            <h2 className="titulo mt-4 text-4xl text-[var(--marinho)] sm:text-5xl">Só três coisas</h2>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              { e: '🤖', t: 'Claude Pro', d: 'O Claude Code é quem monta os vídeos. O plano grátis não serve. A partir de US$ 20 por mês.' },
              { e: '🎙️', t: 'ElevenLabs', d: 'Para a voz da narração. Dá para testar de graça antes de assinar.' },
              { e: '💻', t: 'Um computador', d: 'Windows ou Mac. Não precisa ser computador gamer.' },
            ].map((c) => (
              <article key={c.t} className="cartao p-7 text-center">
                <span className="text-4xl" aria-hidden="true">{c.e}</span>
                <h3 className="titulo mt-3 text-2xl text-[var(--marinho)]">{c.t}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-[#4a3a2c]">{c.d}</p>
              </article>
            ))}
          </div>

          <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2">
            <article className="cartao p-7">
              <h3 className="titulo text-2xl text-[var(--verde)]">É para você se…</h3>
              <ul className="mt-4 space-y-2.5 text-[15px]">
                {['Quer um perfil de vídeos curtos sem aparecer', 'Não sabe programar nem editar vídeo', 'Gosta de obra, engenharia, estádios, mar, história ou corpo humano', 'Quer postar com constância, 3 a 5 vídeos por semana'].map((t) => (
                  <li key={t} className="flex gap-2.5"><span className="text-[var(--verde)]">✔</span>{t}</li>
                ))}
              </ul>
            </article>
            <article className="cartao p-7">
              <h3 className="titulo text-2xl text-[#c0392b]">Não é para você se…</h3>
              <ul className="mt-4 space-y-2.5 text-[15px]">
                {['Procura dinheiro rápido sem postar', 'Não vai assinar o Claude Pro', 'Quer vídeos realistas de cinema', 'Só usa celular (precisa de computador)'].map((t) => (
                  <li key={t} className="flex gap-2.5"><span className="text-[#c0392b]">✖</span>{t}</li>
                ))}
              </ul>
            </article>
          </div>
        </div>
      </section>

      {/* Planos */}
      <section id="planos" className="scroll-mt-4 bg-[var(--amarelo)] py-24">
        <div className="mx-auto max-w-[1180px] px-5 sm:px-8">
          <div className="text-center">
            <span className="pilula bg-[var(--marinho)] text-white">Escolha o seu plano</span>
            <h2 className="titulo mt-4 text-4xl text-[var(--tinta)] sm:text-5xl">Comece a postar hoje</h2>
            <p className="mx-auto mt-3 max-w-xl text-lg text-[#3a2a1c]">Pagamento único. Sem mensalidade do kit.</p>
          </div>
          <div className="mt-14 grid grid-cols-1 gap-8 lg:grid-cols-3 lg:items-start">
            {KIT_PLANS.map((p) => (
              <Plano key={p.id} plano={p} />
            ))}
          </div>

          <div className="cartao mx-auto mt-14 flex max-w-3xl flex-col items-center gap-5 p-7 text-center sm:flex-row sm:text-left">
            <div className="flex h-24 w-24 shrink-0 flex-col items-center justify-center rounded-full bg-[var(--marinho)] text-white">
              <span className="titulo text-4xl leading-none">7</span>
              <span className="text-[11px] font-black uppercase">dias</span>
            </div>
            <p className="text-[16px] leading-relaxed">
              <strong className="titulo text-xl text-[var(--marinho)]">Garantia em todos os planos.</strong>
              <br />
              Se não gostar, peça o reembolso pela Kiwify dentro de 7 dias e receba o valor de volta.
            </p>
          </div>
        </div>
      </section>

      {/* Dúvidas */}
      <section className="bg-[var(--creme)] py-24">
        <div className="mx-auto max-w-[820px] px-5 sm:px-8">
          <div className="text-center">
            <span className="pilula bg-[var(--amarelo)] text-[var(--tinta)]">Dúvidas</span>
            <h2 className="titulo mt-4 text-4xl text-[var(--marinho)] sm:text-5xl">Perguntas frequentes</h2>
          </div>
          <div className="mt-10 space-y-3.5">
            {FAQ.map((f) => (
              <Pergunta key={f.q} q={f.q} r={f.r} />
            ))}
          </div>
        </div>
      </section>

      {/* Chamada final */}
      <section className="bg-[var(--amarelo)] pt-20">
        <div className="mx-auto flex max-w-[1180px] flex-col items-center gap-10 px-5 text-center sm:px-8 lg:flex-row lg:text-left">
          <img src={`${M}vo-prompo-festa.jpg`} alt="Vô Prompo comemorando" loading="lazy" className="w-56 rounded-[28px] border-[6px] border-white shadow-xl" />
          <div>
            <h2 className="titulo text-4xl text-[var(--tinta)] sm:text-5xl">O Vô Prompo já está de capacete. Bora construir?</h2>
            <p className="mt-4 max-w-xl text-lg text-[#3a2a1c]">
              Comece hoje com o Melhor Kit e leve mais 3 temas de bônus. Se não gostar, 7 dias de garantia.
            </p>
            <a href="#planos" className="botao mt-7 text-[22px]">Quero meu kit agora</a>
          </div>
        </div>
        <footer className="mt-20">
          <div className="chao" />
          <div className="bg-[#a76a38] pb-24 pt-5 text-center text-sm font-extrabold text-white/90 sm:pb-6">
            © 2026 <a href="../" className="underline">Prompta</a> · Kit Prompo-Constroe · Pagamentos pela Kiwify
          </div>
        </footer>
      </section>

      {/* Barra fixa no celular */}
      <div
        className={`fixed inset-x-0 bottom-0 z-50 border-t-4 border-[var(--marinho)] bg-white px-4 py-3 shadow-[0_-6px_20px_rgba(0,0,0,0.12)] transition-transform duration-300 sm:hidden ${barra ? 'translate-y-0' : 'translate-y-full'}`}
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <span className="block text-xs font-extrabold text-[#6b5646]">{MELHOR.name}</span>
            <span className="titulo text-2xl text-[var(--tinta)]">{formatBRL(MELHOR.priceCents).replace(',00', '')}</span>
          </div>
          <a href="#planos" className="botao px-5 py-3 text-lg">Quero o kit</a>
        </div>
      </div>
    </div>
  );
}
