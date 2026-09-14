import { SITE_URL } from "@/lib/site";

type Produto = { id: number; nome: string; marca: string; categoria: string; descricao: string | null; imagem: string | null; preco: number | null; linkAfiliado: string | null };
function httpUrl(value: string | null) {
  if (!value) return undefined;
  try {
    const url = new URL(value, SITE_URL);
    return ["http:", "https:"].includes(url.protocol) ? url.href : undefined;
  } catch { return undefined; }
}
export function productSchema(produto: Produto) {
  const url = SITE_URL + "/produtos/" + produto.id;
  const oferta = httpUrl(produto.linkAfiliado);
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": url + "#produto",
    url,
    name: produto.nome,
    description: produto.descricao || undefined,
    image: httpUrl(produto.imagem),
    brand: { "@type": "Brand", name: produto.marca },
    category: produto.categoria,
    offers: oferta && produto.preco !== null && Number.isFinite(produto.preco) && produto.preco >= 0 ? {
      "@type": "Offer", url: oferta, priceCurrency: "BRL", price: produto.preco,
    } : undefined,
  };
}
export function safeJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
