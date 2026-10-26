import { readFile, writeFile } from "node:fs/promises";
import { produtoInput } from "../src/lib/admin-input.ts";
import { APPLIANCES, subcategoriasEletro, eletrosCompativeis } from "../src/lib/appliances.ts";

const pasta = new URL("../conteudo/eletrodomesticos-60/", import.meta.url);
const ofertas = JSON.parse(await readFile(new URL("ofertas-verificadas.json", pasta), "utf8"));
const normalizar = texto => texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\s+/g, " ").trim();
const marcas = { philco: "Philco", electrolux: "Electrolux", consul: "Consul", brastemp: "Brastemp", midea: "Midea", mueller: "Mueller", itatiaia: "Itatiaia", mondial: "Mondial", atlas: "Atlas", panasonic: "Panasonic", colormaq: "Colormaq", oster: "Oster", nespresso: "Nespresso", "philips walita": "Philips Walita", philips: "Philips Walita", wap: "WAP", xiaomi: "Xiaomi", britania: "Britânia", samsung: "Samsung", lg: "LG", elgin: "Elgin" };

function tipo(oferta) {
  const titulo = normalizar(oferta.titulo);
  const grupo = oferta.subcategoria;
  if (grupo === subcategoriasEletro[0]) return titulo.includes("freezer horizontal") ? "Freezer horizontal" : "Geladeira";
  if (grupo === subcategoriasEletro[1]) return titulo.includes("cooktop") ? "Cooktop" : "Fogão";
  if (grupo === subcategoriasEletro[2]) return titulo.includes("lava e seca") ? "Lava e seca" : "Máquina de lavar";
  if (grupo === subcategoriasEletro[3]) return /micro[- ]?ondas/.test(titulo) ? "Micro-ondas" : "Forno elétrico";
  if (grupo === subcategoriasEletro[4]) return /oven|forno/.test(titulo) ? "Air Fryer de forno" : "Air Fryer de cesto";
  if (grupo === subcategoriasEletro[5]) return titulo.includes("nespresso") ? "Cafeteira de cápsulas" : /espresso|expresso/.test(titulo) ? "Cafeteira espresso" : "Cafeteira elétrica de filtro";
  if (grupo === subcategoriasEletro[6]) return titulo.includes("batedeira") ? "Batedeira planetária" : titulo.includes("multiprocessador") ? "Processador de alimentos" : "Liquidificador";
  if (grupo === subcategoriasEletro[7]) return titulo.includes("vertical") ? "Aspirador vertical" : "Robô aspirador";
  if (grupo === subcategoriasEletro[8]) return "Ar-condicionado split";
  return titulo.includes("pressao") ? "Panela de pressão elétrica" : "Panela elétrica de arroz";
}

function preparar(oferta) {
  if (!oferta.asin || !oferta.titulo || !oferta.preco || !oferta.imagem) throw new Error("Oferta incompleta.");
  const link = new URL(oferta.linkAfiliado);
  if (link.hostname !== "www.amazon.com.br" || !link.pathname.includes(`/dp/${oferta.asin}`) || link.searchParams.get("tag") !== "guiatechsite-20") throw new Error(`Link incorreto: ${oferta.asin}`);
  if (!/^https:\/\/m\.media-amazon\.com\//.test(oferta.imagem)) throw new Error(`Imagem inesperada: ${oferta.asin}`);
  const fonte = new Map(oferta.campos.map(([chave, valor]) => [normalizar(chave), String(valor).replace(/\s+/g, " ").trim()]));
  const buscar = (...chaves) => chaves.map(chave => fonte.get(normalizar(chave))).find(Boolean);
  const marcaFonte = buscar("Marca", "Nome da marca", "Fabricante");
  const marca = marcas[normalizar(marcaFonte ?? "")] ?? Object.values(marcas).find(m => normalizar(oferta.titulo).includes(normalizar(m)));
  if (!marca) throw new Error(`Marca não identificada: ${oferta.asin}`);
  const tipoProduto = tipo(oferta);
  const nome = oferta.titulo.replace(/^Electrolux Geladeira Electrolux/i, "Geladeira Electrolux").replace(/^Oster Cafeteira Oster/i, "Cafeteira Oster").replace(/\s+/g, " ").trim();
  const campos = new Map([["Subcategoria", oferta.subcategoria], ["Tipo de produto", tipoProduto]]);
  const ressalvas = [];
  const incluir = (chave, valor) => { if (valor?.trim() && valor.length < 500) campos.set(chave, valor.trim()); };
  const modelo = buscar("Número do modelo", "Nome do modelo");
  if (modelo && modelo.length < 100) incluir("Modelo", modelo);
  const tensaoTitulo = nome.match(/\b(110|127|220)\s*(?:V\b|Volts\b)/i);
  const voltagem = /bivolt/i.test(nome) ? "Bivolt" : tensaoTitulo ? `${tensaoTitulo[1]} V` : buscar("Voltagem");
  if (voltagem && /110|127|220|bivolt/i.test(voltagem)) incluir("Voltagem",voltagem);
  if (tipoProduto === "Ar-condicionado split") {
    const btu = nome.match(/\b([\d.]+)\s*BTU(?:s|\/h)?/i);
    if (!btu) throw new Error(`BTU/h não identificado: ${oferta.asin}`);
    incluir("Capacidade de refrigeração", `${btu[1].replace(/\./g, "")} BTU/h`);
    if (/quente e frio/i.test(nome)) incluir("Ciclo", "Quente e frio");
    else if (/frio/i.test(nome)) incluir("Ciclo", "Frio");
  } else incluir(tipoProduto === "Fogão" ? "Capacidade do forno" : "Capacidade", buscar("Capacidade"));
  const potencia = buscar("Potência", "Potência de saída");
  const wattsTitulo = nome.match(/\b(\d+)\s*W\b/i);
  const wattsFicha = potencia?.match(/^([\d.,]+)\s*(?:watts?|W)\b/i);
  if (tipoProduto !== "Ar-condicionado split" && tipoProduto !== "Robô aspirador") {
    if (wattsTitulo && wattsFicha && Number(wattsTitulo[1]) !== Number(wattsFicha[1].replace(",","."))) ressalvas.push("Há divergência de potência entre título e tabela do anúncio; confirme esse dado antes de comprar.");
    else if (wattsFicha) incluir("Potência",potencia);
    else if (potencia) ressalvas.push("A potência não foi incluída porque a tabela do anúncio não informa a unidade com clareza.");
  }
  if (oferta.asin === "B0F1DMKSH8") ressalvas.push("A potência apresentada na tabela do anúncio não foi incluída; confirme a especificação do ERB62 com o vendedor.");
  if (oferta.asin === "B0H4P43CKG") { campos.delete("Capacidade"); ressalvas.push("Confirme a capacidade do reservatório: esse dado do anúncio não foi incluído na ficha."); }
  incluir("Dimensões", buscar("Dimensões do produto", "Dimensões do item P x L x A", "Dimensões do item C x L x A"));
  incluir("Peso", buscar("Peso do item"));
  incluir("Recursos", buscar("Características especiais"));
  if (oferta.subcategoria === subcategoriasEletro[0]) {
    incluir("Tipo de degelo", /frost free/i.test(nome) ? "Frost Free" : buscar("Tipo de sistema de degelo"));
    incluir("Capacidade do freezer", buscar("Capacidade do freezer"));
    incluir("Número de portas", buscar("Número de portas"));
  }
  const inversor = buscar("Tipo de inversor");
  if (/inverter/i.test(nome) || (inversor && !/\b(nao|sem|no)\b/.test(normalizar(inversor)) && /inversor|inverter/i.test(inversor))) incluir("Inverter", "Sim");
  incluir("Consumo de energia anual", buscar("Consumo de energia anual"));
  incluir("Consumo de energia", buscar("Consumo de energia"));
  incluir("Classificação energética", buscar("Classificação energética"));
  if (oferta.subcategoria === subcategoriasEletro[1]) {
    const bocas = nome.match(/\b(\d+)\s*bocas/i);
    incluir("Número de bocas", bocas?.[1]);
    incluir("Alimentação", buscar("Tipo de combustível", "Fonte de energia"));
  }
  if (oferta.subcategoria === subcategoriasEletro[2]) {
    incluir("Programas", buscar("Opções de ciclo"));
    incluir("Número de programas", buscar("Número de programas", "Número de ciclos padrão", "Número de ciclos de lavagem"));
    incluir("Centrifugação", buscar("Velocidade máxima de rotação"));
    incluir("Consumo de água", buscar("Consumo de água"));
  }
  if (oferta.subcategoria === subcategoriasEletro[3] || oferta.subcategoria === subcategoriasEletro[4]) {
    incluir("Temperatura mínima", buscar("Configuração mínima de temperatura"));
    incluir("Temperatura máxima", buscar("Unidade de configuração de temperatura máxima"));
    incluir("Faixa de temperatura", buscar("Faixa de temperatura"));
    incluir("Níveis de potência", buscar("Número de níveis de potência"));
  }
  if (oferta.subcategoria === subcategoriasEletro[5] || oferta.subcategoria === subcategoriasEletro[7]) incluir("Filtro", buscar("Tipo de filtro"));
  if (oferta.subcategoria === subcategoriasEletro[6]) incluir("Velocidades", buscar("Número de velocidades"));
  const preco = Number(oferta.preco.replace(/[^\d,.]/g, "").replace(/\./g, "").replace(",", "."));
  if (!Number.isFinite(preco) || preco <= 0) throw new Error(`Preço inválido: ${oferta.asin}`);
  const data = new Intl.DateTimeFormat("pt-BR", {timeZone:"America/Sao_Paulo",dateStyle:"short",timeStyle:"short"}).format(new Date(oferta.consultadoEm));
  const condicao = /no Pix ou NuPay/i.test(oferta.oferta) ? "à vista no Pix ou NuPay" : /no Pix/i.test(oferta.oferta) ? "à vista no Pix" : "conforme a oferta exibida";
  const precoFormatado = preco.toLocaleString("pt-BR", {style:"currency",currency:"BRL"});
  const destaques = [...campos].filter(([chave]) => ["Capacidade", "Capacidade de refrigeração", "Potência", "Número de bocas", "Inverter", "Velocidades", "Filtro", "Programas", "Recursos"].includes(chave)).slice(0,4).map(([chave,valor]) => `${chave}: ${valor}`);
  const atencao = [campos.has("Voltagem") ? `Versão anunciada: ${campos.get("Voltagem")}. Confira a tensão da sua instalação antes de comprar.` : "Confira a tensão e a versão na oferta antes de comprar.", "Confira as dimensões e o espaço de instalação.", `Preço consultado em ${data} (Brasília): ${precoFormatado}, ${condicao}. Frete não incluído; preço e disponibilidade podem mudar.`];
  atencao.push(...ressalvas);
  if (tipoProduto === "Ar-condicionado split") atencao.push("Confirme com o vendedor o conjunto fornecido e a necessidade de instalação profissional; instalação não foi incluída neste preço de referência.");
  const produto = produtoInput.parse({
    nome, marca, categoria: APPLIANCES,
    descricao: `${nome}. ${destaques.slice(0,2).join(". ")}${destaques.length ? "." : ""} Oferta consultada na Amazon Brasil em ${data} (horário de Brasília): ${precoFormatado}, ${condicao}. Frete não incluído. Confirme preço, disponibilidade e versão no link da loja.`,
    destaques: destaques.join("\n"), fichaTecnica: [...campos].map(([k,v])=>`${k}: ${v}`).join("\n"),
    pontosPositivos: destaques.slice(0,3).join("\n"), pontosAtencao: atencao.join("\n"),
    imagem: oferta.imagem, preco, linkAfiliado: oferta.linkAfiliado, videoOficial: null,
  });
  return { asin: oferta.asin, subcategoria: oferta.subcategoria, tipo: tipoProduto, consultadoEm: oferta.consultadoEm, condicao, ressalvas, fonte: oferta.url.split("/ref=")[0].split("?")[0], produto };
}

if (ofertas.length !== 60 || new Set(ofertas.map(o=>o.asin)).size !== 60) throw new Error("O lote precisa conter 60 ASINs distintos.");
const lote = ofertas.map(preparar);
for (const sub of subcategoriasEletro) if (lote.filter(p=>p.subcategoria===sub).length !== 6) throw new Error(`Quantidade incorreta: ${sub}`);
for (const registro of lote) if (!eletrosCompativeis([registro.produto,registro.produto])) throw new Error("Metadados de comparação ausentes.");
await writeFile(new URL("produtos-adm.json",pasta),JSON.stringify(lote,null,2)+"\n");
let relatorio = "# Lote Amazon — 60 eletrodomésticos\n\nSeis produtos por subcategoria. Modelos, ofertas, imagens e preços conferidos diretamente na Amazon Brasil em 26/10/2026. Links gerados individualmente pelo SiteStripe com rastreamento `guiatechsite-20`.\n\nPreços são referências da consulta, sem frete. Condições de pagamento estão na descrição e nos pontos de atenção. Não há atualização automática de preço. Vídeos não fornecidos permanecem em branco.\n\n";
for (const sub of subcategoriasEletro) {
  relatorio += `## ${sub}\n\n| Modelo | Tipo | Preço consultado | Condição | Amazon |\n| --- | --- | --- | --- | --- |\n`;
  for (const item of lote.filter(p=>p.subcategoria===sub)) relatorio += `| ${item.produto.nome.replace(/\|/g,"/")} | ${item.tipo} | ${item.produto.preco.toLocaleString("pt-BR",{style:"currency",currency:"BRL"})} | ${item.condicao} | [${item.asin}](${item.produto.linkAfiliado}) |\n`;
  relatorio += "\n";
}
relatorio += "## Dados técnicos que exigem confirmação\n\n";
for (const item of lote.filter(p=>p.ressalvas.length)) relatorio += `- ${item.asin}: ${item.ressalvas.join(" ")}\n`;
relatorio += "\n## Destino e publicação\n\nO ADM online foi consultado em sessão autenticada e ainda oferece somente as oito categorias anteriores. Nenhuma gravação online foi feita. A atualização da categoria e do ADM permanece na branch local `feat/eletrodomesticos`. Publicação, push e merge continuam dependendo da autorização do usuário.\n\nOs registros completos estão em `produtos-adm.json`; as evidências da consulta estão em `ofertas-verificadas.json`. A importação local usa backup e transação, sem alterar produtos existentes.\n";
await writeFile(new URL("CATALOGO.md",pasta),relatorio);
console.log(JSON.stringify({produtos:lote.length,subcategorias:subcategoriasEletro.map(sub=>({nome:sub,quantidade:lote.filter(p=>p.subcategoria===sub).length})),precos:lote.every(p=>p.produto.preco>0),links:lote.every(p=>p.produto.linkAfiliado.includes("tag=guiatechsite-20"))},null,2));
