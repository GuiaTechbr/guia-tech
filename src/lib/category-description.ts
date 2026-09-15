const descricoesCategoria = new Map<string, string>([
  [
    "Smartphone",
    "Compare smartphones, confira especificações, pontos positivos, pontos de atenção e ofertas selecionadas para encontrar o celular ideal para você.",
  ],
  [
    "Notebook",
    "Compare notebooks para trabalho, estudos e uso pessoal, confira especificações, pontos positivos, pontos de atenção e ofertas selecionadas.",
  ],
  [
    "Smart TV",
    "Compare Smart TVs por tamanho de tela, resolução e recursos. Confira características, pontos de atenção e ofertas selecionadas no Guia Tech.",
  ],
  [
    "Games",
    "Explore produtos para games, compare características e confira compatibilidade, pontos de atenção e ofertas selecionadas no Guia Tech.",
  ],
  [
    "Casa Inteligente",
    "Explore dispositivos para casa inteligente, compare recursos e confira compatibilidade, conectividade e ofertas selecionadas no Guia Tech.",
  ],
]);

export function descricaoDaCategoria(categoria: string, quantidade: number): string {
  const personalizada = descricoesCategoria.get(categoria);
  if (personalizada) return personalizada;

  if (quantidade > 0) {
    return `Explore ${quantidade} ${quantidade === 1 ? "produto selecionado" : "produtos selecionados"} na categoria ${categoria}. Compare informações, características e ofertas no Guia Tech.`;
  }

  return `Explore a categoria ${categoria} no Guia Tech e acompanhe novas recomendações, comparações e ofertas.`;
}
