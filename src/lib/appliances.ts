export const APPLIANCES = "Eletrodomésticos";
export const APPLIANCES_PATH = "/categorias/eletrodomesticos";
export const subcategoriasEletro = [
  "Geladeiras e Freezers", "Fogões e Cooktops", "Máquinas de Lavar e Secar",
  "Micro-ondas e Fornos Elétricos", "Air Fryers", "Cafeteiras",
  "Liquidificadores, Batedeiras e Processadores", "Aspiradores e Robôs Aspiradores",
  "Ar-condicionado e Climatização", "Outros Eletrodomésticos",
];

export function normalizarCampo(texto: string) {
  return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/^[-•]\s*/, "").replace(/\s+/g, " ").trim();
}

// O campo já persistido no Turso mantém a compatibilidade com todos os registros.
export function fichaEletro(texto?: string | null) {
  const campos = new Map<string, { titulo: string; valor: string }>();
  for (const linha of texto?.split(/\r?\n/) ?? []) {
    const separador = linha.indexOf(":");
    if (separador < 1) continue;
    const titulo = linha.slice(0, separador).replace(/^[-•]\s*/, "").trim();
    const valor = linha.slice(separador + 1).trim();
    if (valor) campos.set(normalizarCampo(titulo), { titulo, valor });
  }
  return campos;
}

export function campoEletro(texto: string | null | undefined, campo: string) {
  return fichaEletro(texto).get(normalizarCampo(campo))?.valor ?? "";
}

export function campoFormularioEletro(texto: string, campo: string) {
  const linha = texto.split(/\r?\n/).find(linha => linha.includes(":") && normalizarCampo(linha.slice(0, linha.indexOf(":"))) === normalizarCampo(campo));
  return linha ? linha.slice(linha.indexOf(":") + 1).replace(/^ /, "") : "";
}

export function atualizarCampoEletro(texto: string, campo: string, valor: string) {
  const linhas = texto.split(/\r?\n/).filter(linha => {
    const separador = linha.indexOf(":");
    return separador < 1 || normalizarCampo(linha.slice(0, separador)) !== normalizarCampo(campo);
  });
  return [...(valor ? [`${campo}: ${valor}`] : []), ...linhas.filter(Boolean)].join("\n");
}

type ProdutoTipo = { categoria: string; fichaTecnica?: string | null };
export function grupoEletro(produto: ProdutoTipo) {
  if (produto.categoria !== APPLIANCES) return "";
  const sub = campoEletro(produto.fichaTecnica, "Subcategoria");
  const tipo = campoEletro(produto.fichaTecnica, "Tipo de produto");
  return sub && tipo ? `${normalizarCampo(sub)}:${normalizarCampo(tipo)}` : "";
}

export function eletrosCompativeis(produtos: ProdutoTipo[]) {
  if (!produtos.some(p => p.categoria === APPLIANCES)) return true;
  const grupo = grupoEletro(produtos[0]);
  return !!grupo && produtos.every(p => p.categoria === APPLIANCES && grupoEletro(p) === grupo);
}

export function caminhoCategoria(categoria: string) {
  return categoria === APPLIANCES ? APPLIANCES_PATH : `/categoria/${encodeURIComponent(categoria)}`;
}

export function filtrarEletro<T extends { nome: string; marca: string; preco: number | null; fichaTecnica?: string | null }>(
  produtos: T[], filtros: { subcategoria: string; busca: string; minimo: string; tecnica: string },
) {
  return produtos.filter(p =>
    (!filtros.subcategoria || campoEletro(p.fichaTecnica, "Subcategoria") === filtros.subcategoria) &&
    (!filtros.busca || normalizarCampo(p.nome + " " + p.marca).includes(normalizarCampo(filtros.busca))) &&
    (!filtros.minimo || (p.preco !== null && p.preco >= Number(filtros.minimo))) &&
    (!filtros.tecnica || Array.from(fichaEletro(p.fichaTecnica)).some(([chave, campo]) => JSON.stringify([chave, campo.valor]) === filtros.tecnica))
  );
}
