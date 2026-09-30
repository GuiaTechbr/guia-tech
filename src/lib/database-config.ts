export const AVISO_BANCO_LOCAL =
  "Os cadastros neste site estão temporariamente em modo de consulta. A gravação será liberada após a validação do banco online.";

type Ambiente = Record<string, string | undefined>;
type ConfigBanco =
  | { modo: "sqlite"; permiteGravacao: boolean }
  | { modo: "turso"; url: string; authToken: string; permiteGravacao: boolean };

export function obterConfigBanco(env: Ambiente = process.env): ConfigBanco {
  const modo = env.GUIA_DATABASE_MODE?.trim() || "sqlite";
  const url = env.TURSO_DATABASE_URL?.trim();
  const authToken = env.TURSO_AUTH_TOKEN?.trim();
  const gravacao = env.GUIA_TURSO_WRITE_ENABLED;

  if (modo !== "sqlite" && modo !== "turso") {
    throw new Error("GUIA_DATABASE_MODE deve ser sqlite ou turso.");
  }
  if (modo === "sqlite") {
    if (url || authToken || (gravacao && gravacao !== "0")) {
      throw new Error("Há configuração de banco online, mas GUIA_DATABASE_MODE não está definido como turso. Confira a configuração para evitar usar o catálogo errado.");
    }
    return { modo, permiteGravacao: env.VERCEL !== "1" };
  }

  if (!url || !authToken) {
    throw new Error("Configure TURSO_DATABASE_URL e TURSO_AUTH_TOKEN antes de usar o banco online.");
  }
  let destino: URL;
  try { destino = new URL(url); } catch {
    throw new Error("TURSO_DATABASE_URL inválida.");
  }
  if (
    !["libsql:", "https:"].includes(destino.protocol) || !destino.hostname ||
    destino.username || destino.password || destino.search || destino.hash ||
    (destino.pathname !== "" && destino.pathname !== "/")
  ) {
    throw new Error("Use uma TURSO_DATABASE_URL libsql:// ou https://, sem credenciais, parâmetros ou caminhos adicionais.");
  }
  if (gravacao !== undefined && gravacao !== "0" && gravacao !== "1") {
    throw new Error("GUIA_TURSO_WRITE_ENABLED deve ser 0 ou 1.");
  }
  return { modo, url, authToken, permiteGravacao: gravacao === "1" };
}

export function podeGravarBanco(env: Ambiente = process.env) {
  return obterConfigBanco(env).permiteGravacao;
}
