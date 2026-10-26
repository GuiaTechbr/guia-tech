import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { produtoInput } from "../src/lib/admin-input.ts";
import { APPLIANCES, campoEletro } from "../src/lib/appliances.ts";
import { createBackup } from "./lib/backup.mjs";

// Este importador é exclusivamente local. Não carrega .env nem aceita destino remoto.
if (process.env.TURSO_DATABASE_URL || process.env.TURSO_AUTH_TOKEN || process.env.GUIA_DATABASE_MODE === "turso") throw new Error("Importação local bloqueada: há ambiente Turso configurado.");
const aplicar = process.argv.includes("--aplicar");
if (process.argv.slice(2).some(arg=>arg!=="--aplicar")) throw new Error("Use sem argumentos para conferir ou --aplicar para importar no SQLite local.");
const raiz = fileURLToPath(new URL("..",import.meta.url));
const arquivo = path.join(raiz,"conteudo","eletrodomesticos-60","produtos-adm.json");
const lote = JSON.parse(await readFile(arquivo,"utf8"));
assert.equal(lote.length,60);
assert.equal(new Set(lote.map(item=>item.asin)).size,60);
const produtos = lote.map(item=>{
  const produto = produtoInput.parse(item.produto);
  assert.equal(produto.categoria,APPLIANCES);
  assert.ok(campoEletro(produto.fichaTecnica,"Subcategoria"));
  assert.ok(campoEletro(produto.fichaTecnica,"Tipo de produto"));
  assert.ok(produto.preco>0);
  const link=new URL(produto.linkAfiliado);
  assert.equal(link.hostname,"www.amazon.com.br");
  assert.equal(link.searchParams.get("tag"),"guiatechsite-20");
  assert.ok(link.pathname.includes(`/dp/${item.asin}`));
  return produto;
});
const prisma = new PrismaClient({adapter:new PrismaBetterSqlite3({url:path.join(raiz,"prisma","dev.db"),fileMustExist:true})});
try {
  const antes = await prisma.produto.findMany({orderBy:{id:"asc"}});
  const administradoresAntes = await prisma.admin.findMany({orderBy:{id:"asc"}});
  const existentes = new Set(antes.flatMap(p=>{try{return [new URL(p.linkAfiliado).pathname.match(/\/dp\/([A-Z0-9]{10})/)?.[1]].filter(Boolean);}catch{return [];}}));
  const novos = produtos.filter((_,indice)=>!existentes.has(lote[indice].asin));
  if (!aplicar) { console.log(JSON.stringify({modo:"conferência",lote:60,novos:novos.length,jaExistentes:60-novos.length,banco:"prisma/dev.db",gravado:false})); }
  else {
    const backup=await createBackup(path.join(raiz,"prisma","dev.db"),path.join(raiz,"backups"));
    const inseridos = await prisma.$transaction(async tx=>{
      const criados=[];
      for(const data of novos) criados.push(await tx.produto.create({data}));
      const anteriores=await tx.produto.findMany({where:{id:{in:antes.map(p=>p.id)}},orderBy:{id:"asc"}});
      assert.deepEqual(anteriores,antes,"Um cadastro anterior mudou.");
      assert.deepEqual(await tx.admin.findMany({orderBy:{id:"asc"}}),administradoresAntes,"Uma conta administrativa mudou.");
      return criados;
    },{timeout:30000});
    assert.equal(await prisma.produto.count(),antes.length+inseridos.length);
    const resumo={destino:"SQLite local prisma/dev.db",consultadoEm:new Date().toISOString(),inseridos:inseridos.length,jaExistentes:60-novos.length,produtosAntes:antes.length,produtosDepois:antes.length+inseridos.length,anterioresPreservados:true,administradoresPreservados:true,backupVerificado:true,onlineAlterado:false,publicado:false,ids:inseridos.map(p=>p.id)};
    await writeFile(path.join(raiz,"conteudo","eletrodomesticos-60","resultado-importacao-local.json"),JSON.stringify(resumo,null,2)+"\n");
    console.log(JSON.stringify({...resumo,backup:backup.databaseFile},null,2));
  }
} finally { await prisma.$disconnect(); }
