import test from "node:test";
import assert from "node:assert/strict";
import { produtoInput, produtoEdicaoInput } from "../../src/lib/admin-input.ts";
const base = { nome: "Produto", marca: "Marca", categoria: "Acessórios" };
test("Shopee aceita links oficiais HTTPS e recusa destinos enganosos", () => {
  for (const url of ["https://s.shopee.com.br/9zzBL8KGDk", "https://shopee.com.br/product/1/2", "https://www.shopee.com.br/product/1/2", "https://shope.ee/teste"]) {
    assert.equal(produtoInput.parse({ ...base, linkShopee: url }).linkShopee, url);
  }
  for (const url of ["http://shopee.com.br/product/1/2", "https://shopee.com.br.evil.com/", "https://evil.com/shopee.com.br", "https://user@shopee.com.br/", "javascript:alert(1)", "https://shopee.com.br:8443/", "https://s.shopee.com.br/ a"]) {
    assert.equal(produtoInput.safeParse({ ...base, linkShopee: url }).success, false, url);
  }
});
test("clientes antigos preservam Shopee omitida e remoção explícita aceita vazio", () => {
  const parsed = produtoEdicaoInput.parse({ ...base, id: 16, linkAfiliado: "https://www.amazon.com.br/dp/EXAMPLE?tag=guiatechsite-20" });
  assert.equal(parsed.linkShopee, undefined);
  assert.equal(parsed.linkAfiliado, "https://www.amazon.com.br/dp/EXAMPLE?tag=guiatechsite-20");
  for (const linkShopee of ["", "  ", null]) assert.equal(produtoInput.parse({ ...base, linkShopee }).linkShopee, null);
});
