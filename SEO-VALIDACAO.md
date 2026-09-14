# SEO técnico e experiência — 14/09/2026

Base da revisão: 86ce88c. Trabalho exclusivamente local; sem push ou publicação.

## Implementação
- Sitemap com início, ofertas, categorias com produtos e produtos cadastrados. Atualização a cada hora. Busca, favoritos, comparação e Admin ficam fora.
- Robots aponta para o sitemap e restringe Admin/API. Busca e páginas pessoais continuam acessíveis aos robôs para leitura de noindex.
- Metadados próprios e URLs canônicas para início, ofertas e categorias. Categorias vazias recebem noindex. Busca recebe noindex; favoritos e comparação já tinham essa configuração. Layout do Admin define noindex sem alterar autenticação.
- JSON-LD Product nas páginas de produto: nome, marca, categoria, descrição e imagem do cadastro. Offer somente quando há preço válido e link de oferta. Não são gerados avaliações, estoque, prazo de preço, identificação de vendedor ou descontos sem dados.
- Serialização do JSON-LD escapa caracteres que poderiam encerrar a tag script.
- Categorias usam o parâmetro já decodificado pelo Next.js, evitando decodificação dupla.
- Rodapé oferece links reais para favoritos e comparação; contraste dos textos foi reforçado.
- Foco de teclado visível; campos de busca podem encolher em telas pequenas.
- Barra de comparação reorganizada no celular, com espaço reservado e afastamento do acesso fixo à oferta.
- Ações dos cartões empilhadas no celular para evitar botões apertados.

## Validação realizada
- npm run lint: aprovado.
- npm run build: aprovado, incluindo /robots.txt e /sitemap.xml.
- Após o último ajuste visual dos cartões: lint do componente e teste no navegador aprovados.
- Navegador separado com dados de teste: produto em 320, 390, 768 e 1280px; comparação e favoritos em 320, 390 e 1280px, sem overflow horizontal da página. A tabela de comparação mantém rolagem própria.
- Barra de comparação e oferta sem sobreposição nos tamanhos móveis testados.
- Filtro de diferenças e favoritos conferidos; cartões finais conferidos em 320px.
- noindex conferido em busca, categoria vazia, favoritos, comparação e login do Admin.
- 13 destinos dos links internos da página inicial/rodapé responderam sem erro HTTP.
- Sitemap e robots conferidos pelas respostas locais; canônica e JSON-LD conferidos no HTML renderizado.
- Serialização segura, preço zero, ausência de oferta e rejeição de protocolo inseguro testados.

## Limites e próximos passos
- O banco não tem data de última atualização: o sitemap não inventa lastModified usando a data de criação ou de compilação.
- Preços continuam dependendo da atualização do cadastro. O site não consulta estoque/preço em tempo real.
- Produtos sem preço/link continuam descritos em Schema.org, mas não recebem uma oferta fictícia para satisfazer requisitos de resultados enriquecidos.
- A validação externa no Google Rich Results Test e a submissão do sitemap no Search Console ficam para depois da publicação autorizada. Nenhuma garantia de indexação ou aparência nos resultados.
- A revisão de acessibilidade foi focada nos componentes citados, não uma certificação completa WCAG.

Referências: [Google — Product](https://developers.google.com/search/docs/appearance/structured-data/product-snippet), [Google — noindex](https://developers.google.com/search/docs/crawling-indexing/block-indexing) e documentação do Next.js instalada no projeto.
