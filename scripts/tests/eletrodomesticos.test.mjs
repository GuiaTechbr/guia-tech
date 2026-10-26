import test from "node:test";
import assert from "node:assert/strict";
import { APPLIANCES, APPLIANCES_PATH, subcategoriasEletro, campoEletro, campoFormularioEletro, atualizarCampoEletro, fichaEletro, eletrosCompativeis, filtrarEletro, caminhoCategoria } from "../../src/lib/appliances.ts";
import { produtoInput } from "../../src/lib/admin-input.ts";

// Somente objetos em memória. Estes testes não conectam nem gravam em banco.
const geladeira = { nome: "Modelo A", marca: "Marca Á", categoria: APPLIANCES, preco: 2000, fichaTecnica: "Subcategoria: Geladeiras e Freezers\nTipo de produto: Geladeira\nCapacidade: 400 L\nInverter: Sim" };
test("ADM conserva metadados no campo persistido e preserva conteúdo existente", () => {
  let ficha = atualizarCampoEletro("Capacidade: 400 L\nConsumo: 40 kWh/mês", "Subcategoria", "Geladeiras e Freezers");
  ficha = atualizarCampoEletro(ficha, "Tipo de produto", "Geladeira");
  assert.equal(campoEletro(ficha, "Subcategoria"), "Geladeiras e Freezers");
  const dados = produtoInput.parse({ ...geladeira, fichaTecnica: ficha });
  assert.equal(dados.fichaTecnica, ficha);
  assert.ok(dados.fichaTecnica.includes("Consumo: 40 kWh/mês"));
  assert.equal(campoFormularioEletro(atualizarCampoEletro(ficha, "Tipo de produto", "Máquina de "), "Tipo de produto"), "Máquina de ");
  assert.equal(subcategoriasEletro.length, 10);
  assert.equal(caminhoCategoria(APPLIANCES), APPLIANCES_PATH);
  assert.equal(caminhoCategoria("Smart TV"), "/categoria/Smart%20TV");
});
test("comparação recusa freezer com geladeira, categorias misturadas e metadados ausentes", () => {
  assert.equal(eletrosCompativeis([geladeira, { ...geladeira, nome: "Modelo B" }]), true);
  assert.equal(eletrosCompativeis([geladeira, { ...geladeira, fichaTecnica: geladeira.fichaTecnica.replace("Tipo de produto: Geladeira", "Tipo de produto: Freezer") }]), false);
  assert.equal(eletrosCompativeis([geladeira, { categoria: "Notebook" }]), false);
  assert.equal(eletrosCompativeis([geladeira, { ...geladeira, fichaTecnica: null }]), false);
  assert.equal(eletrosCompativeis([{ categoria: "Notebook" }, { categoria: "Smartphone" }]), true);
});
test("ficha técnica elimina campos vazios e repetições com acentos ou marcadores", () => {
  const ficha = fichaEletro("Potência: 1500 W\n• Potencia: 1600 W\nDimensões: \nInverter: Não");
  assert.equal(ficha.size, 2);
  assert.equal(ficha.get("potencia").valor, "1600 W");
  assert.equal(ficha.has("dimensoes"), false);
});
test("filtros combinam subcategoria, busca, preço e dados técnicos sem modificar a entrada", () => {
  const itens = [geladeira, { ...geladeira, nome: "Modelo B", preco: null }, { ...geladeira, nome: "Modelo C", fichaTecnica: "Subcategoria: Nova subcategoria\nTipo de produto: Novo tipo\nPotência: 500 W" }];
  const filtros = { subcategoria: "", busca: "", minimo: "", tecnica: "" };
  assert.equal(filtrarEletro(itens, filtros).length, 3);
  assert.equal(filtrarEletro(itens, { ...filtros, subcategoria: "Geladeiras e Freezers", busca: "marca a", minimo: "1000", tecnica: JSON.stringify(["inverter", "Sim"]) }).length, 1);
  assert.equal(filtrarEletro(itens, { ...filtros, subcategoria: "Nova subcategoria" }).length, 1);
  assert.equal(filtrarEletro(itens, { ...filtros, minimo: "2500" }).length, 0);
  assert.equal(itens.length, 3);
});
