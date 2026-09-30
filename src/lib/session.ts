import { createHmac, timingSafeEqual } from "node:crypto";

export const COOKIE_NAME = "guia_tech_admin";
export const DURACAO_SESSAO_SEGUNDOS = 60 * 60 * 24 * 7;

function assinar(valor: string) {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET não configurado.");
  return createHmac("sha256", secret).update(valor).digest("hex");
}

export function criarSessaoAdmin(adminId: number, agora = Date.now()) {
  if (!Number.isSafeInteger(adminId) || adminId <= 0 || adminId > 2147483647) {
    throw new Error("Administrador inválido.");
  }

  const emitidaEm = Math.floor(agora / 1000);
  const expiraEm = emitidaEm + DURACAO_SESSAO_SEGUNDOS;
  const payload = `v1.${adminId}.${emitidaEm}.${expiraEm}`;
  return `${payload}.${assinar(payload)}`;
}

// O prazo faz parte da assinatura: não depende da exclusão do cookie pelo navegador.
// Cookies antigos, sem prazo assinado, exigem um novo login.
export function lerSessaoAdmin(valor: string | undefined, agora = Date.now()) {
  if (!valor || valor.length > 128) return null;
  const partes = /^v1\.([1-9]\d{0,9})\.([1-9]\d{0,10})\.([1-9]\d{0,10})\.([a-f0-9]{64})$/.exec(valor);
  if (!partes) return null;

  const [, id, emissao, expiracao, assinatura] = partes;
  const adminId = Number(id);
  const emitidaEm = Number(emissao);
  const expiraEm = Number(expiracao);
  const agoraSegundos = Math.floor(agora / 1000);
  if (
    adminId > 2147483647 ||
    emitidaEm > agoraSegundos ||
    expiraEm <= agoraSegundos ||
    expiraEm - emitidaEm !== DURACAO_SESSAO_SEGUNDOS
  ) return null;

  const payload = `v1.${id}.${emissao}.${expiracao}`;
  if (!timingSafeEqual(Buffer.from(assinatura, "hex"), Buffer.from(assinar(payload), "hex"))) {
    return null;
  }
  return { adminId, expiraEm };
}

export function verificarSessaoAdmin(valor: string | undefined, agora = Date.now()) {
  return lerSessaoAdmin(valor, agora) !== null;
}
