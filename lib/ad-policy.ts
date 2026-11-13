// Shared taxonomy: unknown businesses do not participate in automatic placement.
export const networkCategories = [
  ["geral", "Selecione o segmento"],
  ["vestuario", "Roupas, calçados e moda"],
  ["beleza", "Beleza e cosméticos"],
  ["alimentacao", "Alimentação e doces"],
  ["fitness", "Fitness e suplementos"],
  ["esportes", "Esportes"],
  ["saude", "Saúde"],
  ["eletronicos", "Eletrônicos e celulares"],
  ["tecnologia", "Tecnologia"],
  ["games", "Games"],
  ["casa", "Casa e decoração"],
  ["pets", "Pets e veterinária"],
  ["automotivo", "Automotivo"],
  ["cursos", "Cursos e mentorias"],
  ["joias", "Joias e acessórios"],
  ["infantil", "Bebês e infantil"],
  ["papelaria", "Papelaria"],
  ["musica", "Música"],
  ["viagem", "Viagens e turismo"],
  ["fotografia", "Fotografia"],
  ["design", "Design"],
  ["marketing", "Marketing"],
  ["financas", "Finanças"],
  ["juridico", "Serviços jurídicos"],
  ["construcao", "Construção"],
  ["agro", "Agro"],
  ["artesanato", "Artesanato"],
] as const;
const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
const aliases: Record<string, string> = {
  moda: "vestuario",
  roupas: "vestuario",
  calcados: "vestuario",
  calcado: "vestuario",
  roupa: "vestuario",
  comida: "alimentacao",
  alimentos: "alimentacao",
  cosmeticos: "beleza",
  tecnologia: "tecnologia",
  servicos: "geral",
};
export function networkCategory(value?: string) {
  const name = normalize(value || "geral");
  const id = aliases[name] || name;
  return networkCategories.some(([key]) => key === id) ? id : "geral";
}
const rules: [string, RegExp][] = [
  [
    "vestuario",
    /\b(roupas?|moda|calcados?|tenis|vestidos?|leggings?|camisetas?|jeans|boutique)\b/,
  ],
  [
    "fitness",
    /\b(fitness|academia|suplementos?|whey|musculacao|personal trainer)\b/,
  ],
  ["esportes", /\b(esportes?|futebol|ciclismo|corrida|atletismo)\b/],
  [
    "saude",
    /\b(saude|clinica|farmacia|medicamentos?|nutricionista|odontologia)\b/,
  ],
  [
    "beleza",
    /\b(beleza|cosmeticos?|maquiagem|salao|barbearia|cabeleireir[oa]|perfumes?|manicure)\b/,
  ],
  [
    "alimentacao",
    /\b(alimentacao|comida|restaurante|pizzaria|hamburguer|doces?|confeitaria|bolos?|lanchonete)\b/,
  ],
  [
    "eletronicos",
    /\b(eletronicos?|celulares?|iphone|smartphone|notebook|computador)\b/,
  ],
  ["tecnologia", /\b(tecnologia|software|aplicativos?|informatica)\b/],
  ["games", /\b(games?|videogame|playstation|xbox|jogos)\b/],
  ["pets", /\b(pets?|veterinari[ao]|racao|petshop)\b/],
  ["casa", /\b(decoracao|moveis|cortinas?|utensilios|cama mesa|casa)\b/],
  ["automotivo", /\b(automotivo|carros?|motos?|oficina|autopecas)\b/],
  ["cursos", /\b(cursos?|mentorias?|aulas?|escola)\b/],
  ["joias", /\b(joias?|bijuterias?|semijoias?|relogios?)\b/],
  ["infantil", /\b(infantil|bebes?|brinquedos?|criancas?)\b/],
];
export function businessSegments(category?: string, text = "") {
  const segments = new Set<string>();
  const primary = networkCategory(category);
  if (primary !== "geral") segments.add(primary);
  for (const [id, rule] of rules)
    if (rule.test(normalize(text))) segments.add(id);
  return [...segments];
}
const related = [
  ["vestuario", "joias", "infantil"],
  ["fitness", "esportes", "saude"],
  ["eletronicos", "tecnologia", "games"],
  ["casa", "construcao", "artesanato"],
  ["design", "marketing", "fotografia"],
];
export function competingSegments(a: string[], b: string[]) {
  return a.some((left) =>
    b.some(
      (right) =>
        left === right ||
        related.some((group) => group.includes(left) && group.includes(right)),
    ),
  );
}
export function safeAdDestination(value: string) {
  try {
    const url = new URL(value.trim());
    if (
      !["http:", "https:"].includes(url.protocol) ||
      !url.hostname ||
      url.username ||
      url.password
    )
      return null;
    return url.href;
  } catch {
    return null;
  }
}
export function adNetworkMonth(now = Date.now()) {
  return new Date(now).toISOString().slice(0, 7);
}
