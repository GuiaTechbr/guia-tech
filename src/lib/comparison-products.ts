export type ProdutoIndice = { id: number; nome: string; marca: string; categoria: string };
export type ProdutoComparacao = ProdutoIndice & {
  preco: number | null; imagem: string | null; fichaTecnica: string | null;
  pontosPositivos: string | null; pontosAtencao: string | null;
};
export function normalizarBusca(texto: string) {
  return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR").replace(/[^\p{L}\p{N}]+/gu, " ").trim();
}
export const camposComparacao = {
  id: true, nome: true, marca: true, categoria: true, preco: true, imagem: true,
  fichaTecnica: true, pontosPositivos: true, pontosAtencao: true,
} as const;
