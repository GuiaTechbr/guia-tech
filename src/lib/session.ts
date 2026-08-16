import { createHmac, timingSafeEqual } from "crypto";

const COOKIE_NAME = "guia_tech_admin";

function getSecret() {
  const secret = process.env.AUTH_SECRET;

  if (!secret) {
    throw new Error("AUTH_SECRET não configurado.");
  }

  return secret;
}

function assinar(valor: string) {
  return createHmac("sha256", getSecret())
    .update(valor)
    .digest("hex");
}

export function criarSessaoAdmin(adminId: number) {
  const valor = String(adminId);
  const assinatura = assinar(valor);

  return `${valor}.${assinatura}`;
}

export function verificarSessaoAdmin(valor: string | undefined) {
  if (!valor) {
    return false;
  }

  const partes = valor.split(".");

  if (partes.length !== 2) {
    return false;
  }

  const [adminId, assinatura] = partes;

  if (!adminId || !assinatura) {
    return false;
  }

  const assinaturaEsperada = assinar(adminId);

  if (assinatura.length !== assinaturaEsperada.length) {
    return false;
  }

  return timingSafeEqual(
    Buffer.from(assinatura),
    Buffer.from(assinaturaEsperada)
  );
}

export { COOKIE_NAME };