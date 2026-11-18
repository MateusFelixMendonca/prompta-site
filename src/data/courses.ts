export type CourseLevel = 'basico' | 'intermediario' | 'avancado' | 'especializacoes';

export interface Course {
  id: string;
  title: string;
  subtitle: string;
  levelLabel: string;
  tools: string[];
  outcomes: string[];
}

export interface LearningTrack {
  index: string;
  title: string;
  levelLabel: string;
  description: string;
  accentHex: string;
}

export interface CatalogStat {
  value: string;
  label: string;
  detail: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export const CATALOG_STATS: CatalogStat[] = [
  { value: 'Em breve', label: 'Curso de IA', detail: 'Formação do básico ao avançado em produção' },
  { value: '4 fases', label: 'Trilha planejada', detail: 'Dos primeiros passos até criar com IA' },
  { value: 'Dia a dia', label: 'Foco do curso', detail: 'IA como apoio para estudar, escrever e se organizar' },
  { value: '7 dias', label: 'Garantia Kiwify', detail: 'Reembolso direto pela plataforma' },
];

export const LEARNING_TRACKS: LearningTrack[] = [
  {
    index: '01',
    title: 'Primeiros Passos com IA',
    levelLabel: 'Fase 1 · Básico',
    description:
      'Comece do zero: entenda o que é a IA e aprenda a conversar com o ChatGPT, o Claude e o Gemini para tirar dúvidas, estudar e organizar ideias.',
    accentHex: '#2EE6D6',
  },
  {
    index: '02',
    title: 'IA na Rotina',
    levelLabel: 'Fase 2 · Intermediário',
    description:
      'Use a IA para escrever e revisar textos, montar planilhas, planejar a semana e resolver as tarefas do trabalho e da casa com mais facilidade.',
    accentHex: '#38BDF8',
  },
  {
    index: '03',
    title: 'Assistentes & Ferramentas',
    levelLabel: 'Fase 3 · Avançado',
    description:
      'Conheça assistentes que leem os seus arquivos e ferramentas que facilitam tarefas repetitivas, sempre com você no controle das decisões.',
    accentHex: '#60A5FA',
  },
  {
    index: '04',
    title: 'Criação com IA',
    levelLabel: 'Fase 4 · Criação',
    description:
      'Crie imagens, apresentações e vídeos com a ajuda da IA para os estudos, o trabalho ou as suas redes.',
    accentHex: '#818CF8',
  },
];

export const FLAGSHIP_COURSE: Course = {
  id: 'prompta-ia-completo',
  title: 'Formação Prompta: IA do Básico ao Avançado',
  subtitle:
    'Um curso para você aprender a usar a inteligência artificial do básico ao avançado, como apoio no seu dia a dia. As aulas estão sendo gravadas e as inscrições abrem em breve.',
  levelLabel: 'Básico ao Avançado',
  tools: ['ChatGPT', 'Claude', 'Gemini', 'Ferramentas de imagem e vídeo'],
  outcomes: [
    'Conversar com a IA e fazer boas perguntas, sem precisar saber programar',
    'Usar a IA para estudar, escrever e organizar a rotina',
    'Conhecer assistentes e ferramentas que facilitam o dia a dia, com você no controle',
    'Criar imagens e vídeos com a ajuda da IA para trabalho, estudos ou redes',
  ],
};

export const FAQS: FaqItem[] = [
  {
    question: 'Quando o curso de IA da Prompta abre?',
    answer:
      'O curso está em produção. Ele vai ensinar a usar a IA do básico ao avançado como apoio no dia a dia, e as inscrições abrem em breve.',
  },
  {
    question: 'Os prompts fazem parte do curso?',
    answer:
      'Não. A área de prompts é separada do curso: são kits prontos para projetos específicos, vendidos à parte. O primeiro é o Kit Prompo-Constroe.',
  },
  {
    question: 'O que é o Kit Prompo-Constroe?',
    answer:
      'É uma pasta de prompts e ferramentas que você abre no Claude Code. Você conversa com o Claude e ele escreve o roteiro, monta as cenas em 3D, sincroniza com a sua narração e entrega o vídeo vertical pronto para postar. Tem 3 planos: Básico (R$ 37), Melhor Kit (R$ 67) e Avançado (R$ 147).',
  },
  {
    question: 'Como funciona o pagamento?',
    answer:
      'O pagamento é feito no checkout oficial da Kiwify, com PIX, cartão ou boleto. Assim que o pagamento é aprovado, o acesso chega no seu e-mail e o kit fica na área de membros da Kiwify.',
  },
  {
    question: 'E se eu não gostar?',
    answer:
      'Todos os produtos têm 7 dias de garantia. Se não for para você, peça o reembolso pela própria Kiwify e recebe o valor de volta.',
  },
];
