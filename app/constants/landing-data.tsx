
import {
  Instagram, ShoppingBag, Heart, Dumbbell, UtensilsCrossed, BookOpen,
  Store, Building2, Music, Camera, Megaphone, Briefcase, Link2, Zap,
  BarChart3, QrCode, Film, Calculator, Bot, Target, Sparkles, PlayCircle,
  Gift, CheckCircle, Infinity as InfinityIcon, MessageCircle,
  Image as ImageIcon, Crown
} from "lucide-react";

// --- CONFIGURAÇÕES VISUAIS ---
export const BRAND = {
  primary: "#6366f1",
  secondary: "#8b5cf6",
  gradient: "bg-gradient-to-r from-[#6366f1] to-[#8b5cf6]",
  gradientHover: "hover:from-[#5558e3] hover:to-[#7c4fee]",
  textGradient: "bg-clip-text text-transparent bg-gradient-to-r from-[#6366f1] to-[#8b5cf6]",
};

// --- DADOS ---
export const nichos = [
  { icon: <Instagram size={18} />, name: "Criadores" },
  { icon: <ShoppingBag size={18} />, name: "Afiliados" },
  { icon: <Heart size={18} />, name: "Nutricionistas" },
  { icon: <Dumbbell size={18} />, name: "Personal Trainers" },
  { icon: <UtensilsCrossed size={18} />, name: "Restaurantes" },
  { icon: <BookOpen size={18} />, name: "Infoprodutores" },
  { icon: <Store size={18} />, name: "E-commerce" },
  { icon: <Building2 size={18} />, name: "Agências" },
  { icon: <Music size={18} />, name: "Artistas" },
  { icon: <Camera size={18} />, name: "Fotógrafos" },
  { icon: <Megaphone size={18} />, name: "Marketing" },
  { icon: <Briefcase size={18} />, name: "Freelancers" },
];

export const features = [
  {
    icon: <Link2 size={24} />,
    title: "Página de Links",
    desc: "Totalmente customizável. Você escolhe cada detalhe.",
    tag: "GRÁTIS",
    color: "from-blue-500 to-cyan-500"
  },
  {
    icon: <Zap size={24} />,
    title: "Encurtador de Links",
    desc: "Links curtos e memoráveis com analytics Básico.",
    tag: "GRÁTIS",
    color: "from-yellow-500 to-orange-500"
  },
  {
    icon: <BarChart3 size={24} />,
    title: "Analytics Completo",
    desc: "Saiba de onde vem cada clique. Cidade, dispositivo, horário.",
    tag: "ULTRA",
    color: "from-purple-500 to-pink-500"
  },
  {
    icon: <QrCode size={24} />,
    title: "QR Code Dinâmico",
    desc: "QR Code em sua pagina de links",
    tag: "GRÁTIS",
    color: "from-green-500 to-emerald-500"
  },
  {
    icon: <Film size={24} />,
    title: "Brain Roteirista IA",
    desc: "Roteiros virais com 95% de chance de engajamento.",
    tag: "PRO",
    color: "from-red-500 to-rose-500"
  },
  {
    icon: <Calculator size={24} />,
    title: "Gestão Financeira",
    desc: "Controle vendas, custos e veja seu lucro real.",
    tag: "ULTRA",
    color: "from-indigo-500 to-violet-500"
  },
  {
    icon: <Bot size={24} />,
    title: "AI Studio",
    desc: "Chat IA, remoção de fundo, upscale de imagens.",
    tag: "ULTRA",
    color: "from-fuchsia-500 to-purple-500"
  },
  {
    icon: <Target size={24} />,
    title: "Pixel & UTM",
    desc: "Rastreie conversões com precisão cirúrgica.",
    tag: "ULTRA",
    color: "from-teal-500 to-cyan-500"
  },
];

export const stats = [
  { value: "10.800", suffix: "+", label: "Criadores Ativos" },
  { value: "2.4", suffix: "M+", label: "Cliques Rastreados" },
  { value: "847", prefix: "R$", suffix: "k+", label: "Gerado para Usuários" },
  { value: "4.9", suffix: "/5", label: "Avaliação Média" },
];

export const testimonials = [
  {
    text: "Saí do Linktree e nunca mais voltei. O Freelinnk me dá dados que eu pagava caro pra ter.",
    author: "Mariana Costa",
    role: "Criadora • 89k seguidores",
    avatar: "https://i.pravatar.cc/100?img=5",
    increase: "+312% vendas"
  },
  {
    text: "O Brain sugeriu um roteiro e meu vídeo fez 500k views. Nunca tinha acontecido antes.",
    author: "Lucas Mendes",
    role: "TikToker • 234k seguidores",
    avatar: "https://i.pravatar.cc/100?img=12",
    increase: "500k views"
  },
  {
    text: "Finalmente sei quanto realmente lucro por mês. A gestão financeira mudou meu negócio.",
    author: "Fernanda Lima",
    role: "Personal Trainer",
    avatar: "https://i.pravatar.cc/100?img=9",
    increase: "+487% consultas"
  },
  {
    text: "O encurtador com analytics me mostrou qual produto vender. Triplicou minha comissão.",
    author: "Pedro Henrique",
    role: "Afiliado Hotmart",
    avatar: "https://i.pravatar.cc/100?img=11",
    increase: "3x comissões"
  },
  {
    text: "Interface linda, customização total. Minha página ficou a cara da minha marca.",
    author: "Ana Paula",
    role: "Nutricionista Online",
    avatar: "https://i.pravatar.cc/100?img=23",
    increase: "+89 pacientes/mês"
  },
  {
    text: "Sai do zero e hoje faturo 5 dígitos. O Freelinnk foi parte essencial dessa jornada.",
    author: "Rafael Torres",
    role: "Infoprodutor",
    avatar: "https://i.pravatar.cc/100?img=15",
    increase: "5 dígitos/mês"
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
    name: "Pro Creator",
    monthlyPrice: 34.90,
    yearlyPrice: 349,
    badge: "🔥 MAIS ESCOLHIDO",
    badgeColor: "from-amber-400 to-orange-500",
    description: "Crescimento acelerado com IA essencial.",
    features: [
      { text: "6 Ideias Virais (IA) / dia", icon: <Sparkles className="w-4 h-4" /> },
      { text: "3 Roteiros de Vídeo / dia", icon: <PlayCircle className="w-4 h-4" /> },
      { text: "Ferramenta de Sorteios", icon: <Gift className="w-4 h-4" />, isHot: true },
      { text: "Analytics Avançados", icon: <BarChart3 className="w-4 h-4" /> },
      { text: "Remover Marca Freelinnk", icon: <CheckCircle className="w-4 h-4" /> },
      { text: "Suporte Prioritário", icon: <Zap className="w-4 h-4" /> },
    ],
    cta: "Testar 7 Dias Grátis",
    color: "blue",
    popular: true
  },
  {
    id: "ultra",
    name: "Ultra Business",
    monthlyPrice: 77.90,
    yearlyPrice: 779,
    badge: "👑 PODER MÁXIMO",
    badgeColor: "from-purple-600 to-pink-600",
    description: "Sua agência de marketing completa no bolso.",
    features: [
      { text: "Ideias e Roteiros ILIMITADOS", icon: <InfinityIcon className="w-4 h-4" /> },
      { text: "Aprimorador de Fotos (10/dia)", icon: <Sparkles className="w-4 h-4" /> },
      { text: "AI Studio (Chat + Audio2Text)", icon: <MessageCircle className="w-4 h-4" /> },
      { text: "Calculadora de Lucros IA", icon: <Calculator className="w-4 h-4" /> },
      { text: "7 Imagens IA / dia + Remove BG", icon: <ImageIcon className="w-4 h-4" /> },
      { text: "Pixel FB + Google GA4", icon: <Target className="w-4 h-4" /> },
      { text: "WhatsApp Pessoal VIP", icon: <Crown className="w-4 h-4" /> },
    ],
    cta: "Testar 7 Dias Grátis",
    color: "purple",
    popular: false
  }
];