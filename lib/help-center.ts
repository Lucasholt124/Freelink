export const helpCategories = [
  {
    id: "all",
    label: "Todos os assuntos",
    description: "Encontre seu próximo passo.",
  },
  {
    id: "start",
    label: "Primeiros passos",
    description: "Do perfil ao primeiro compartilhamento.",
  },
  {
    id: "links",
    label: "Links e contatos",
    description: "Os caminhos que conectam seus clientes.",
  },
  {
    id: "appearance",
    label: "Aparência e páginas",
    description: "Uma identidade para cada marca.",
  },
  {
    id: "billing",
    label: "Planos e pagamentos",
    description: "Assinatura, cobrança e faturas.",
  },
  {
    id: "tools",
    label: "Ferramentas do negócio",
    description: "Anúncios, rastreamento e gestão.",
  },
  {
    id: "account",
    label: "Conta e acesso",
    description: "Perfil, entrada e segurança.",
  },
] as const;
export type HelpCategory = (typeof helpCategories)[number]["id"];
export type HelpAction =
  | { label: string; href: string; pageScoped?: boolean }
  | { label: string; account: true };
export interface HelpArticle {
  id: string;
  category: Exclude<HelpCategory, "all">;
  question: string;
  description: string;
  steps: string[];
  keywords: string;
  action?: HelpAction;
}
export const helpArticles: HelpArticle[] = [
  {
    id: "help-comecar",
    category: "start",
    question: "Como deixo minha página pronta para compartilhar?",
    description:
      "Comece pelo essencial: sua identidade, um destino e o endereço da sua página.",
    steps: [
      "Em Aparência e perfil, escolha a página que deseja editar e preencha o nome, a foto ou logo e a bio.",
      "Defina as cores da marca, confira a prévia e clique em Salvar alterações.",
      "Em Meus links, adicione seu primeiro botão. Depois, use Ver página para conferir o resultado publicado.",
    ],
    keywords:
      "onboarding começar configurar criar publicar primeira página perfil bio inicio tutorial",
    action: {
      label: "Preparar minha página",
      href: "/dashboard/settings",
      pageScoped: true,
    },
  },
  {
    id: "help-compartilhar",
    category: "start",
    question: "Onde encontro o link da minha página?",
    description:
      "O endereço da página pode ser usado na bio das suas redes, em mensagens e em materiais da marca.",
    steps: [
      "Abra Meus links ou Aparência e perfil e confira a página escolhida no seletor Página em edição.",
      "Clique no ícone Copiar endereço desta página, ao lado do seletor.",
      "Cole o endereço na bio ou onde quiser divulgar. Ver página abre a versão que seus visitantes encontram.",
    ],
    keywords:
      "copiar url endereço compartilhar divulgar bio instagram qr code link publico",
    action: {
      label: "Encontrar meu endereço",
      href: "/dashboard/links",
      pageScoped: true,
    },
  },
  {
    id: "help-editar-links",
    category: "links",
    question: "Como adiciono ou edito um link?",
    description:
      "Cada página tem sua própria lista. Confira o nome da marca no seletor antes de começar.",
    steps: [
      "Em Meus links, clique em Adicionar link e escolha o tipo de destino.",
      "Escreva um título claro, preencha o endereço e confira a prévia do botão. Finalize em Adicionar à página.",
      "Para alterar um botão existente, use Editar na linha dele e clique em Salvar link. Você também pode adicionar uma imagem ou etiqueta nas opções do formulário.",
    ],
    keywords:
      "adicionar botão url site criar alterar editar miniatura imagem etiqueta tutorial",
    action: {
      label: "Organizar meus links",
      href: "/dashboard/links",
      pageScoped: true,
    },
  },
  {
    id: "help-whatsapp",
    category: "links",
    question: "Como coloco o WhatsApp com uma mensagem pronta?",
    description:
      "O formulário monta o endereço para você. Novos contatos já vêm com destaque ativado.",
    steps: [
      "Em Meus links, clique em Adicionar link e escolha WhatsApp.",
      "Digite o número com código do país e DDD. No Brasil, comece com +55, seguido do DDD e do número.",
      "Se quiser, escreva a Mensagem inicial. Ela será preenchida quando o visitante abrir a conversa.",
      "Confira a prévia e adicione à página. Você pode desmarcar Destacar este link se preferir.",
    ],
    keywords:
      "zap wpp wa.me whatsapp telefone número mensagem automática pronta contato fixar fixado destacar",
    action: {
      label: "Adicionar um contato",
      href: "/dashboard/links",
      pageScoped: true,
    },
  },
  {
    id: "help-ordem",
    category: "links",
    question: "Como mudo a ordem ou destaco um botão?",
    description:
      "A ordem e o destaque são salvos na hora. A cor dos botões destacados acompanha a sua marca.",
    steps: [
      "Arraste o link pelo ícone à esquerda ou use as setas para mover para cima ou para baixo.",
      "Use a estrela para ativar ou retirar o destaque. Novos links de WhatsApp, e-mail e telefone já começam destacados.",
      "Se a busca estiver preenchida, limpe-a antes de reorganizar. Assim, você vê a lista completa.",
    ],
    keywords:
      "ordenar ordem reorganizar mover arrastar estrela fixar destaque desmarcar remover destaque",
    action: {
      label: "Ajustar meus botões",
      href: "/dashboard/links",
      pageScoped: true,
    },
  },
  {
    id: "help-excluir-link",
    category: "links",
    question: "Como removo um link da página?",
    description:
      "A exclusão remove o botão da página escolhida. Confira o título e a marca antes de confirmar.",
    steps: [
      "Abra Meus links e localize o botão. Você pode buscar pelo título ou endereço.",
      "Clique no ícone de lixeira e leia a confirmação.",
      "Confirme apenas se quiser remover esse link. Para mudar o destino mantendo o botão, escolha Editar.",
    ],
    keywords: "excluir remover apagar deletar botão lixeira",
    action: {
      label: "Abrir meus links",
      href: "/dashboard/links",
      pageScoped: true,
    },
  },
  {
    id: "help-cores",
    category: "appearance",
    question: "Como uso as cores da minha marca?",
    description:
      "Você pode começar por uma paleta ou informar a cor exata da marca, como #7144E8.",
    steps: [
      "Abra Aparência e perfil e escolha a página no seletor.",
      "Em Cores da marca, selecione uma paleta ou use o seletor e o código hexadecimal para personalizar a cor principal.",
      "Escolha um fundo com cor lisa, gradiente ou imagem e confira a prévia em Claro e Escuro.",
      "Clique em Salvar alterações para publicar. A cor da marca continua presente nos dois temas.",
    ],
    keywords:
      "cor cores paleta fundo marca personalizar tema claro escuro hexadecimal logo imagem gradiente tutorial",
    action: {
      label: "Personalizar minha marca",
      href: "/dashboard/settings",
      pageScoped: true,
    },
  },
  {
    id: "help-salvar",
    category: "appearance",
    question: "Minha alteração ainda não apareceu na página. O que faço?",
    description:
      "A prévia mostra o rascunho. As alterações de aparência só chegam à página pública depois de salvar.",
    steps: [
      "Confira a página selecionada e o aviso próximo de Salvar alterações.",
      "Se aparecer Alterações ainda não publicadas, revise a prévia e salve.",
      "Use Ver página para abrir a versão publicada. Se ela já estava aberta, atualize a aba.",
      "Se continuar diferente, envie ao suporte o endereço da página e qual alteração você tentou fazer.",
    ],
    keywords:
      "salvar publicar rascunho não atualiza atualização sumiu carregamento cache prévia",
    action: {
      label: "Conferir minha aparência",
      href: "/dashboard/settings",
      pageScoped: true,
    },
  },
  {
    id: "help-varias-paginas",
    category: "appearance",
    question: "Posso criar uma página para cada marca?",
    description:
      "As páginas adicionais têm nome, endereço, cores e links independentes, gerenciados na mesma conta.",
    steps: [
      "Use Nova página em Aparência e perfil ou Meus links.",
      "Escolha o nome da marca, um endereço disponível e a paleta inicial.",
      "Depois, alterne no seletor Página em edição. Os rascunhos de aparência ficam separados por página.",
      "O Free inclui a principal. O Pro permite até 10 páginas adicionais e o Ultra até 30.",
    ],
    keywords:
      "múltiplas varias páginas perfis subconta sub-pagina outra marca comercio empresas limite 10 30",
    action: {
      label: "Ver minhas páginas",
      href: "/dashboard/settings",
      pageScoped: true,
    },
  },
  {
    id: "help-endereco",
    category: "appearance",
    question: "Como altero o endereço da minha página?",
    description:
      "O endereço é a parte que identifica seu perfil no Freelinnk. Ao trocá-lo, atualize os locais onde você o divulgou.",
    steps: [
      "Em Aparência e perfil, escolha a página e abra Endereço da página.",
      "Informe o novo endereço e aguarde a confirmação de disponibilidade.",
      "Leia a confirmação antes de alterar: o endereço antigo deixa de abrir essa página.",
      "Copie o novo link e atualize a bio das redes sociais e seus materiais.",
    ],
    keywords:
      "username slug nome de usuário url endereço renomear trocar link antigo 404",
    action: {
      label: "Conferir meu endereço",
      href: "/dashboard/settings",
      pageScoped: true,
    },
  },
  {
    id: "help-planos",
    category: "billing",
    question: "Qual plano combina com o meu momento?",
    description:
      "O Free permite começar com a página de links. Pro e Ultra acrescentam ferramentas para o negócio.",
    steps: [
      "O Pro reúne Hub de Anúncios, sorteios e páginas adicionais para profissionalizar sua presença.",
      "O Ultra acrescenta gestão com CRM e calculadora, proteção da página contra anúncios e mais páginas adicionais.",
      "Em Plano e cobrança, compare os recursos e escolha Mensal ou Anual. O anual é pago em uma cobrança única.",
    ],
    keywords:
      "free gratuito pro ultra preço preços planos comprar assinatura upgrade mensal anual diferenças",
    action: { label: "Comparar planos", href: "/dashboard/billing#planos" },
  },
  {
    id: "help-teste",
    category: "billing",
    question: "Como funciona o teste de 7 dias e a cobrança anual?",
    description:
      "A contratação dos planos pagos oferece 7 dias de teste. Depois, a cobrança segue o plano e o período escolhidos.",
    steps: [
      "Escolha Mensal ou Anual em Plano e cobrança e confira o valor antes de continuar.",
      "No anual, o valor exibido é o total de um ano, cobrado de uma vez após o teste. No mensal, a cobrança é por mês após o teste.",
      "Confira no checkout Stripe as datas e condições da assinatura antes de confirmar.",
      "Se decidir cancelar, use a opção na área de assinatura do painel.",
    ],
    keywords:
      "7 dias sete grátis teste trial garantia cobrança cartão anual ano mês mensal renovação pagamento",
    action: {
      label: "Ver períodos e valores",
      href: "/dashboard/billing#planos",
    },
  },
  {
    id: "help-faturas",
    category: "billing",
    question: "Onde vejo minhas faturas ou altero o cartão?",
    description:
      "Para assinaturas pagas, essas opções ficam no portal de cobrança da Stripe, acessado pelo painel.",
    steps: [
      "Abra Plano e cobrança e procure a área de gerenciamento da assinatura.",
      "Clique em Gerenciar Cartão e Faturas para abrir o portal.",
      "Se sua assinatura ainda não aparecer depois da compra, atualize o painel e confira se entrou na conta utilizada na contratação. Se necessário, fale com o suporte.",
    ],
    keywords:
      "fatura faturas recibo boleto pagamento cartão stripe comprovante portal cobrança segunda via",
    action: { label: "Abrir plano e cobrança", href: "/dashboard/billing" },
  },
  {
    id: "help-cancelar",
    category: "billing",
    question: "Como gerencio ou cancelo minha assinatura?",
    description:
      "O gerenciamento fica em Plano e cobrança, na conta que possui a assinatura.",
    steps: [
      "Abra Plano e cobrança e confira seu plano atual.",
      "Para cartão e faturas, use Gerenciar Cartão e Faturas. Para encerrar a assinatura, escolha Cancelar assinatura.",
      "Leia a confirmação exibida no painel e finalize apenas se quiser cancelar. Se houver alguma dificuldade, entre em contato com o suporte.",
    ],
    keywords:
      "cancelar cancelamento encerrar assinatura plano renovação reembolso suporte",
    action: { label: "Gerenciar assinatura", href: "/dashboard/billing" },
  },
  {
    id: "help-anuncios",
    category: "tools",
    question: "Como começo a usar o Hub de Anúncios?",
    description:
      "O Hub permite criar campanhas para apresentar seu negócio na rede de páginas do Freelinnk, conforme o plano.",
    steps: [
      "Abra Hub de anúncios e confira a disponibilidade e os limites apresentados para sua conta.",
      "Prepare o título, o endereço de destino, o texto e as imagens ou vídeos da campanha.",
      "Revise o material e acompanhe as visualizações e os cliques no próprio Hub.",
    ],
    keywords:
      "ads anúncios anuncios campanha tráfego trafego views visualizações nicho hub marketing",
    action: { label: "Conhecer o Hub", href: "/dashboard/ads" },
  },
  {
    id: "help-ferramentas",
    category: "tools",
    question: "Onde encontro Pixel, sorteios, CRM e calculadora?",
    description:
      "As ferramentas têm áreas próprias no menu lateral. A disponibilidade é informada pelo painel conforme o plano.",
    steps: [
      "Em Crescimento, acesse Hub de anúncios e Sorteios.",
      "Em Gestão, use Financeiro e CRM para acompanhar seu negócio, ou Pixel e Analytics para configurar os identificadores de rastreamento.",
      "Se o recurso estiver bloqueado, confira em Plano e cobrança quais recursos estão disponíveis para sua conta.",
    ],
    keywords:
      "pixel facebook meta google ga4 analytics análise instagram sorteios crm financeiro calculadora gestão ferramentas",
    action: { label: "Ver as ferramentas do painel", href: "/dashboard" },
  },
  {
    id: "help-conta",
    category: "account",
    question: "Como altero meus dados de conta e opções de acesso?",
    description:
      "Os dados de login ficam em Minha conta. O nome e a bio que seus visitantes veem são editados em Aparência e perfil.",
    steps: [
      "Abra Minha conta pelo atalho abaixo ou pelo seu avatar no topo do painel.",
      "Veja as opções de perfil, e-mail e segurança disponíveis para sua conta.",
      "Se você utiliza um provedor como o Google para entrar, use as opções de acesso desse provedor quando necessário.",
    ],
    keywords:
      "conta dados login email e-mail senha password segurança alterar nome avatar google acesso",
    action: { label: "Abrir minha conta", account: true },
  },
  {
    id: "help-acesso",
    category: "account",
    question:
      "Minha página não abre ou o painel não termina de carregar. Como resolver?",
    description:
      "O endereço completo e a etapa em que o erro aparece ajudam a identificar o problema.",
    steps: [
      "Confirme o endereço que você abriu. Se mudou o endereço da página, use o novo link.",
      "Atualize a página e, para acessar o painel, confira se está conectado à conta correta.",
      "Se o erro continuar, envie ao suporte o endereço completo, uma imagem do erro e diga se aconteceu ao abrir a página, entrar na conta ou salvar uma alteração.",
    ],
    keywords:
      "erro bug 404 não abre não carrega loading carregando travado tela branca página não encontrada celular safari entrar suporte",
    action: { label: "Voltar à visão geral", href: "/dashboard" },
  },
];

const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
export function findHelpArticles(
  query: string,
  category: HelpCategory = "all",
) {
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  return helpArticles.filter((article) => {
    if (category !== "all" && article.category !== category) return false;
    const content = normalize(
      [
        article.question,
        article.description,
        ...article.steps,
        article.keywords,
      ].join(" "),
    );
    return terms.every((term) => content.includes(term));
  });
}
export function supportLinks(topic?: string) {
  const configured = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(
    /\D/g,
    "",
  );
  const phone =
    configured && /^\d{10,15}$/.test(configured) ? configured : "5579999383543";
  const message = topic
    ? `Olá! Preciso de ajuda com esta dúvida no Freelinnk: ${topic}`
    : "Olá! Preciso de ajuda com minha conta no Freelinnk.";
  return {
    whatsapp: `https://wa.me/${phone}?text=${encodeURIComponent(message)}`,
    email: `mailto:Lucasholt2021@gmail.com?subject=${encodeURIComponent(topic ? `Freelinnk — ${topic}` : "Suporte Freelinnk")}`,
  };
}
