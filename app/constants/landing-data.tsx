import {
  Instagram, ShoppingBag, Heart, Dumbbell, UtensilsCrossed, BookOpen,
  Store, Building2, Music, Camera, Megaphone, Briefcase, Link2,
  BarChart3, Calculator, Target,
  Gift,  Infinity as InfinityIcon,
  Image as  Crown,  TrendingUp, SearchX, Globe, Layers, Shield
} from "lucide-react";


export const BRAND = {
  primary: "#4f46e5",
  secondary: "#9333ea",
  gradient: "bg-gradient-to-r from-[#4f46e5] to-[#9333ea]",
  gradientHover: "hover:from-[#4338ca] hover:to-[#7e22ce]",
  textGradient: "bg-clip-text text-transparent bg-gradient-to-r from-[#4f46e5] to-[#9333ea]",
};

// --- DADOS ---
export const nichos = [
  { icon: <Store size={18} />, name: "Lojistas" },
  { icon: <ShoppingBag size={18} />, name: "Afiliados" },
  { icon: <Building2 size={18} />, name: "Agências" },
  { icon: <Instagram size={18} />, name: "Criadores" },
  { icon: <Dumbbell size={18} />, name: "Personal Trainers" },
  { icon: <Heart size={18} />, name: "Saúde & Estética" },
  { icon: <UtensilsCrossed size={18} />, name: "Delivery" },
  { icon: <BookOpen size={18} />, name: "Infoprodutores" },
  { icon: <Music size={18} />, name: "Artistas" },
  { icon: <Camera size={18} />, name: "Fotógrafos" },
  { icon: <Megaphone size={18} />, name: "Marketing" },
  { icon: <Briefcase size={18} />, name: "Profissionais" },
];

export const features = [
  {
    icon: <Link2 size={24} />,
    title: "Vitrine de Vendas (Bio Link)",
    desc: "Crie uma página rápida, bonita e feita para fechar negócios no seu perfil.",
    tag: "GRÁTIS",
    color: "from-blue-500 to-cyan-500"
  },
  {
    icon: <Megaphone size={24} />,
    title: "Hub de Anúncios Nativo",
    desc: "Nós mostramos seu produto na página de outras pessoas para gerar tráfego automático.",
    tag: "PRO",
    color: "from-purple-500 to-pink-500"
  },
  {
    icon: <Calculator size={24} />,
    title: "CRM e Calculadora de Lucro",
    desc: "Registre vendas e saiba quanto de lucro líquido exato entrou no seu bolso hoje.",
    tag: "ULTRA",
    color: "from-emerald-500 to-teal-500"
  },
  {
    icon: <Target size={24} />,
    title: "Pixel de Remarketing",
    desc: "Instale o Pixel do FB/Google e faça anúncios baratos pra quem já te visitou.",
    tag: "PRO",
    color: "from-red-500 to-orange-500"
  },
  {
    icon: <BarChart3 size={24} />,
    title: "Analytics Avançado",
    desc: "Descubra horários de pico, cidade dos clientes e qual botão mais converte.",
    tag: "PRO",
    color: "from-indigo-500 to-violet-500"
  },
  {
    icon: <Layers size={24} />,
    title: "Múltiplas Vitrines",
    desc: "Crie até 30 páginas de links para clientes diferentes na mesma conta.",
    tag: "ULTRA",
    color: "from-fuchsia-500 to-purple-500"
  },
  {
    icon: <Gift size={24} />,
    title: "Ferramenta de Sorteios",
    desc: "Puxe comentários do Instagram e faça sorteios justos para aumentar engajamento.",
    tag: "PRO",
    color: "from-yellow-500 to-amber-500"
  },
  {
    icon: <SearchX size={24} />,
    title: "Blindagem de Concorrência",
    desc: "Nenhum anúncio de outras pessoas aparecerá na sua página pessoal.",
    tag: "ULTRA",
    color: "from-slate-700 to-slate-900"
  },
];

export const stats = [
  { value: "4.800", suffix: "+", label: "Lojistas Faturando" },
  { value: "1.2", suffix: "M+", label: "Vendas Rastreadas" },
  { value: "15", suffix: "k", label: "Tráfego Grátis (Mês)" },
  { value: "4.9", suffix: "/5", label: "Avaliação de Conversão" },
];

export const testimonials = [
  {
    text: "O Hub de Anúncios mudou meu jogo. Sem eu pagar Ads no Facebook, recebo tráfego na minha vitrine todo dia de outras páginas.",
    author: "Ricardo Sales",
    role: "Dono de E-commerce",
    avatar: "https://i.pravatar.cc/100?img=11",
    increase: "+1.2k visitas/mês"
  },
  {
    text: "Parei de usar agrupadores de botões e passei a usar o Freelinnk por causa do Pixel. Agora faço remarketing só pra quem clicou.",
    author: "Mariana Costa",
    role: "Afiliada Hotmart",
    avatar: "https://i.pravatar.cc/100?img=5",
    increase: "-40% custo no FB Ads"
  },
  {
    text: "A calculadora de lucro me mostrou que eu tava tomando prejuízo numa taxa. Hoje eu precifico certo e fecho a meta pelo próprio painel.",
    author: "Fernanda Lima",
    role: "Lojista (Moda Fitness)",
    avatar: "https://i.pravatar.cc/100?img=9",
    increase: "+25% Margem Real"
  },
  {
    text: "Acesso aos dados da minha audiência me diz a hora exata de postar. Sei de que cidade compram mais e foco o frete lá.",
    author: "Lucas Mendes",
    role: "Vendedor de InfoProdutos",
    avatar: "https://i.pravatar.cc/100?img=12",
    increase: "Triplicou conversão"
  },
  {
    text: "Tenho uma agência e uso o plano Ultra pra criar até 30 páginas de clientes meus. Todos adoram o design e a velocidade.",
    author: "Rafael Torres",
    role: "Dono de Agência Digital",
    avatar: "https://i.pravatar.cc/100?img=15",
    increase: "30 Clientes Atendidos"
  },
  {
    text: "Usei o Sorteador pra bombar uma publicação no Instagram. A galera clicou no link da bio e o Analytics rastreou tudo.",
    author: "Ana Paula",
    role: "Nutricionista Esportiva",
    avatar: "https://i.pravatar.cc/100?img=23",
    increase: "+89 leads/semana"
  },
];

export const realPages = [
  {
    id: 1,
    image: "/ImpulsioneWeb.jpeg",
    name: "@ImpulsioneWeb",
    type: "Agência Digital",
    color: "from-blue-600 to-indigo-600"
  },
  {
    id: 2,
    image: "/Glam-Fit.jpeg",
    name: "@Glam-Fit",
    type: "Moda Fitness",
    color: "from-pink-500 to-rose-500"
  },
  {
    id: 3,
    image: "/Studio-Oliveira.jpeg",
    name: "@Studio-Oliveira",
    type: "Nails Designer",
    color: "from-purple-500 to-violet-500"
  },
  {
    id: 4,
    image: "/Penelope-Variedades.jpeg",
    name: "@Penelope-Variedades",
    type: "Loja Virtual",
    color: "from-orange-500 to-amber-500"
  },
];

export const pricingPlans = [
  {
    id: "pro",
    name: "Pro Seller",
    monthlyPrice: 34.90,
    yearlyPrice: 349,
    badge: "🔥 PARA INICIAR",
    badgeColor: "from-blue-500 to-cyan-500",
    description: "Tráfego real e rastreamento para fechar as primeiras vendas.",
    features: [
      { text: "Hub de Anúncios (2 Campanhas)", icon: <Megaphone className="w-4 h-4" /> },
      { text: "Até 2.000 Views de Anúncio / Mês", icon: <TrendingUp className="w-4 h-4" />, isHot: true },
      { text: "Pixel FB e Google Analytics", icon: <Target className="w-4 h-4" /> },
      { text: "Métricas de Cliques (Cidade/Hora)", icon: <BarChart3 className="w-4 h-4" /> },
      { text: "Múltiplas Páginas (Até 10 Perfis)", icon: <Layers className="w-4 h-4" /> },
      { text: "Sem Logo do Freelinnk", icon: <Shield className="w-4 h-4" /> },
    ],
    cta: "Assinar Pro — Teste 7 Dias",
    color: "blue",
    popular: false
  },
  {
    id: "ultra",
    name: "Ultra Business",
    monthlyPrice: 77.90,
    yearlyPrice: 779,
    badge: "👑 MÁQUINA DE VENDAS",
    badgeColor: "from-purple-600 to-pink-600",
    description: "Sua agência de tráfego, CRM e gestão em um só lugar.",
    features: [
      { text: "Hub de Anúncios (3 Campanhas)", icon: <InfinityIcon className="w-4 h-4" /> },
      { text: "Até 15.000 Views de Anúncio / Mês", icon: <Globe className="w-4 h-4" />, isHot: true },
      { text: "Calculadora de Lucros e CRM", icon: <Calculator className="w-4 h-4" /> },
      { text: "Proteção Total (Sem Ads na sua Bio)", icon: <SearchX className="w-4 h-4" /> },
      { text: "Múltiplas Páginas (Até 30 Perfis)", icon: <Layers className="w-4 h-4" /> },
      { text: "Suporte VIP no WhatsApp", icon: <Crown className="w-4 h-4" /> },
    ],
    cta: "Assinar Ultra — Crescimento Máximo",
    color: "purple",
    popular: true
  }
];