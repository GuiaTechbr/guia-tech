import test from 'node:test';
import assert from 'node:assert/strict';
import { accessoryGroup, accessoryGroups, accessoryPath, selectAccessories } from '../../src/lib/accessories.ts';

const product = (nome, fichaTecnica) => ({ nome, fichaTecnica, categoria: 'Acessórios' });
test('cases mencionando fones e carregadores continuam em Cases', () => {
  for (const name of ['Case Geekria Hard Shell para Earbuds Sony, JBL e Bose', 'Capa para AirPods Pro 3 com Trava', 'Case UGREEN para Fones, Cabos e Carregadores', 'Bolsa Geekria de Nylon para Headphones Sony e JBL']) {
    assert.equal(accessoryGroup(product(name)), 'cases', name);
  }
});
test('fones com estojo incluso permanecem em Fones', () => {
  assert.equal(accessoryGroup(product('Fone Bluetooth Redmi Buds 6 com Estojo')), 'fones');
});
test('classifica os formatos legados e novos do catálogo', () => {
  for (const [name, expected] of [
    ['QCY T13 ANC', 'fones'], ['Samsung Galaxy Buds Core', 'fones'],
    ['Headset Logitech H390 USB-A', 'fones'], ['Samsung T7 Shield 2TB', 'armazenamento'],
    ['SSD ADATA Legend 860 1TB', 'armazenamento'], ['Carregador GaN com cabo USB-C', 'carregadores'],
    ['Power Bank Anker Nano', 'carregadores'], ['Hub USB-C UGREEN', 'cabos-hubs'],
    ['Cabo USB-C para Lightning', 'cabos-hubs'], ['Combo Teclado e Mouse Logitech', 'perifericos'],
    ['Adaptador Bluetooth TP-Link UB500', 'rede'], ['Caixa de Som Bluetooth JBL', 'caixas-de-som'],
    ['Suporte para Notebook ELG', 'outros'],
  ]) assert.equal(accessoryGroup(product(name)), expected, name);
});
test('metadados explícitos têm prioridade, sem classificar outras categorias', () => {
  assert.equal(accessoryGroup(product('Modelo novo', 'Subcategoria: Fones e headsets')), 'fones');
  assert.equal(accessoryGroup({ nome: 'Headset', categoria: 'Games' }), '');
});
test('seleções particionam o catálogo sem perder ou duplicar produtos', () => {
  const products = [product('Fone JBL'), product('Case para JBL'), product('Modelo desconhecido'), product('SSD Kingston')];
  const groups = accessoryGroups.flatMap(g => selectAccessories(products, g.slug));
  assert.equal(new Set(groups).size, products.length);
  assert.equal(groups.length, products.length);
  assert.deepEqual(selectAccessories(products, 'fones'), [products[0]]);
  assert.equal(selectAccessories(products, '').length, products.length);
  assert.equal(accessoryPath('fones'), '/categoria/Acess%C3%B3rios?subcategoria=fones');
});
