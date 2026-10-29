export const ACCESSORIES = "Acessórios";
export const ACCESSORIES_PATH = "/categoria/Acess%C3%B3rios";
export const accessoryGroups = [
  { slug: "fones", nome: "Fones e headsets" },
  { slug: "cases", nome: "Cases e capas" },
  { slug: "carregadores", nome: "Carregadores e power banks" },
  { slug: "cabos-hubs", nome: "Cabos e hubs" },
  { slug: "armazenamento", nome: "Armazenamento" },
  { slug: "perifericos", nome: "Teclados e mouses" },
  { slug: "rede", nome: "Rede e conectividade" },
  { slug: "caixas-de-som", nome: "Caixas de som" },
  { slug: "monitores", nome: "Monitores" },
  { slug: "impressoras", nome: "Impressoras" },
  { slug: "leitores-digitais", nome: "Leitores digitais" },
  { slug: "outros", nome: "Outros acessórios" },
] as const;

type Accessory = { nome: string; categoria: string; fichaTecnica?: string | null };
const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

export function accessoryGroup(produto: Accessory): string {
  if (produto.categoria !== ACCESSORIES) return "";
  // Explicit catalog metadata takes precedence; legacy products use their name.
  const explicit = produto.fichaTecnica?.match(/^(?:[-•]\s*)?Subcategoria:\s*(.+)$/im)?.[1];
  const group = explicit && accessoryGroups.find(g => normalize(g.nome) === normalize(explicit) || g.slug === normalize(explicit));
  if (group) return group.slug;
  const name = normalize(produto.nome);
  // Cases often mention headphones and charging accessories in their names.
  if (/^(case|estojo|bolsa|capa)\b/.test(name)) return "cases";
  if (/\b(fone|fones|headphone|headphones|headset|earbuds|buds|freebuds|airpods)\b|\bqcy t\d/.test(name)) return "fones";
  if (/\b(case|estojo|bolsa|capa)\b/.test(name)) return "cases";
  if (/carregador|power\s?bank|pilhas|maggo/.test(name)) return "carregadores";
  if (/\b(cabo|hub)\b/.test(name)) return "cabos-hubs";
  if (/\b(ssd|hd externo|pen drive|cartao de memoria|samsung t[79])\b/.test(name)) return "armazenamento";
  if (/\b(teclado|mouse|mouses)\b/.test(name)) return "perifericos";
  if (/roteador|repetidor|switch|adaptador.*(wi-fi|wifi|bluetooth)|\bmesh\b/.test(name)) return "rede";
  if (/caixa de som/.test(name)) return "caixas-de-som";
  if (/\bmonitor\b/.test(name)) return "monitores";
  if (/impressora/.test(name)) return "impressoras";
  if (/\bkindle\b/.test(name)) return "leitores-digitais";
  return "outros";
}

export function accessoryPath(slug = "") {
  return ACCESSORIES_PATH + (slug ? `?subcategoria=${encodeURIComponent(slug)}` : "");
}

export function selectAccessories<T extends Accessory>(products: T[], slug: string) {
  return products.filter(p => p.categoria === ACCESSORIES && (!slug || accessoryGroup(p) === slug));
}
