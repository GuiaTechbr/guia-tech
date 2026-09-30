import { z } from "zod";

function textoObrigatorio(nome: string, maximo: number) {
  return z.string({ error: `${nome}: informe um texto.` })
    .trim().min(1, `${nome} é obrigatório.`)
    .max(maximo, `${nome}: use até ${maximo} caracteres.`);
}

function textoOpcional(nome: string, maximo: number) {
  return z.string({ error: `${nome}: informe um texto.` }).trim()
    .max(maximo, `${nome}: use até ${maximo} caracteres.`)
    .nullish().transform((valor) => valor || null);
}

function urlWeb(valor: string) {
  if (!/^https?:\/\//i.test(valor) || /[\s\\]/.test(valor)) return false;
  try {
    const url = new URL(valor);
    return !!url.hostname && !url.username && !url.password;
  } catch {
    return false;
  }
}

function linkOpcional(nome: string, permitirImagemLocal = false) {
  return textoOpcional(nome, 8192).refine((valor) => {
    if (valor === null) return true;
    if (permitirImagemLocal && /^\/(?!\/)/.test(valor) && !/[\s\\]/.test(valor)) return true;
    return urlWeb(valor);
  }, `${nome}: informe um link válido iniciado por https:// ou http://${permitirImagemLocal ? ", ou o caminho da imagem iniciado por /" : ""}.`);
}

const preco = z.union([
  z.number(),
  z.string().trim()
    .refine((valor) => valor === "" || /^\d+(?:[.,]\d{1,2})?$/.test(valor), "Preço: informe um número positivo com até duas casas decimais, ou deixe em branco.")
    .transform((valor) => valor === "" ? null : Number(valor.replace(",", "."))),
], { error: "Preço: informe um número ou deixe em branco." })
  .nullish()
  .pipe(z.number({ error: "Preço inválido." }).min(0, "Preço não pode ser negativo.")
    .max(999999999.99, "Preço acima do valor permitido.")
    .refine((valor) => Math.abs(valor * 100 - Math.round(valor * 100)) < 0.00001, "Preço: use até duas casas decimais.")
    .nullish())
  .transform((valor) => valor ?? null);

// Aceita as categorias já cadastradas; somente estes campos podem ser gravados.
export const produtoInput = z.object({
  nome: textoObrigatorio("Nome", 250),
  marca: textoObrigatorio("Marca", 120),
  categoria: textoObrigatorio("Categoria", 120),
  descricao: textoOpcional("Descrição", 20000),
  destaques: textoOpcional("Destaques", 10000),
  fichaTecnica: textoOpcional("Ficha técnica", 10000),
  pontosPositivos: textoOpcional("Pontos positivos", 10000),
  pontosAtencao: textoOpcional("Pontos de atenção", 10000),
  preco,
  imagem: linkOpcional("Imagem", true),
  linkAfiliado: linkOpcional("Link de afiliado"),
  videoOficial: linkOpcional("Vídeo oficial"),
});

const id = z.union([
  z.number(),
  z.string().regex(/^[1-9]\d{0,9}$/, "ID do produto inválido.").transform(Number),
], { error: "ID do produto é obrigatório." })
  .pipe(z.number().int("ID do produto inválido.").min(1, "ID do produto inválido.").max(2147483647, "ID do produto inválido."));

export const produtoEdicaoInput = produtoInput.extend({ id });
export const produtoExclusaoInput = z.object({ id });

export const loginInput = z.object({
  email: textoObrigatorio("Email", 254).toLowerCase().pipe(z.email({ error: "Informe um email válido." })),
  // Não remover espaços nem normalizar a senha: eles podem fazer parte dela.
  senha: z.string({ error: "Senha é obrigatória." }).min(1, "Senha é obrigatória.").max(1024, "Senha muito longa."),
});
