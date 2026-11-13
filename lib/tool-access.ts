export type LockedTool = "ads" | "giveaway" | "finance" | "tracking";

export const toolAccess = {
  ads: {
    name: "Hub de anúncios",
    plan: "pro",
    planName: "Pro",
    eyebrow: "MAIS CAMINHOS ATÉ A SUA MARCA",
    title: "Seu negócio pode ir além da sua bio.",
    description:
      "Apresente seus produtos em outras páginas da rede Freelinnk e acompanhe o interesse pelas suas campanhas.",
    previewTitle: "Sua próxima campanha",
    helpId: "help-anuncios",
    benefits: [
      [
        "Presença na rede",
        "Crie anúncios para apresentar sua marca em outras páginas do Freelinnk.",
      ],
      [
        "Campanhas do seu jeito",
        "Defina a imagem, o texto e o destino de cada anúncio.",
      ],
      [
        "Resultados para acompanhar",
        "Consulte exibições e cliques para entender o desempenho.",
      ],
    ],
    note: "Exibições e campanhas seguem os limites do plano. Anúncios não garantem cliques ou vendas.",
  },
  giveaway: {
    name: "Sorteios",
    plan: "pro",
    planName: "Pro",
    eyebrow: "UM NOVO MOTIVO PARA PARTICIPAR",
    title: "Aproxime seu público. Crie seu próximo sorteio.",
    description:
      "Reúna os participantes por um link ou QR Code e conduza o sorteio em um espaço organizado.",
    previewTitle: "Da inscrição ao resultado",
    helpId: "help-ferramentas",
    benefits: [
      [
        "Convite fácil de compartilhar",
        "Crie um link de inscrição para divulgar nas suas redes.",
      ],
      [
        "Também no presencial",
        "Use o QR Code para receber inscrições nos seus eventos.",
      ],
      [
        "Tudo no mesmo lugar",
        "Acompanhe os participantes, realize o sorteio e consulte o histórico.",
      ],
    ],
    note: "As inscrições são recebidas pelo link ou QR Code criado no painel.",
  },
  finance: {
    name: "Financeiro e CRM",
    plan: "ultra",
    planName: "Ultra",
    eyebrow: "MAIS CLAREZA PARA O SEU NEGÓCIO",
    title: "Entenda o que vende. Saiba o que fica.",
    description:
      "Organize vendas, gastos e clientes e use a calculadora para enxergar o lucro de cada produto.",
    previewTitle: "Uma venda, por dentro",
    helpId: "help-ferramentas",
    benefits: [
      [
        "Lucro sem adivinhação",
        "Considere o preço de venda, os custos e as taxas no seu cálculo.",
      ],
      [
        "Rotina financeira organizada",
        "Registre vendas e despesas para acompanhar o seu negócio.",
      ],
      [
        "Seus clientes por perto",
        "Mantenha os cadastros e as informações dos clientes no CRM.",
      ],
    ],
    note: "Os cálculos usam os valores que você informa. Mantenha seus custos e registros atualizados.",
  },
  tracking: {
    name: "Pixel e Analytics",
    plan: "ultra",
    planName: "Ultra",
    eyebrow: "CONHEÇA MELHOR OS SEUS ACESSOS",
    title: "Cada visita pode ajudar na próxima decisão.",
    description:
      "Conecte o Meta Pixel e o Google Analytics à sua página de links para acompanhar os acessos nas suas ferramentas de análise.",
    previewTitle: "Suas integrações, reunidas",
    helpId: "help-ferramentas",
    benefits: [
      [
        "Meta Pixel conectado",
        "Informe o ID do seu Pixel para integrar a página à Meta.",
      ],
      [
        "Google Analytics 4",
        "Conecte o ID de medição da sua propriedade do GA4.",
      ],
      [
        "Configuração pelo painel",
        "Salve os identificadores sem editar o código da sua página.",
      ],
    ],
    note: "Você precisa ter seus próprios IDs. Os relatórios são consultados na Meta e no Google Analytics.",
  },
} as const;
