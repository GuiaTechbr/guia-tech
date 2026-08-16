import {
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from "crypto";

const KEY_LENGTH = 64;

export function criarHashSenha(senha: string): string {
  const salt = randomBytes(16).toString("hex");

  const hash = scryptSync(
    senha,
    salt,
    KEY_LENGTH
  ).toString("hex");

  return `${salt}:${hash}`;
}

export function verificarSenha(
  senha: string,
  senhaHash: string
): boolean {
  const partes = senhaHash.split(":");

  if (partes.length !== 2) {
    return false;
  }

  const [salt, hashArmazenado] = partes;

  const hashCalculado = scryptSync(
    senha,
    salt,
    KEY_LENGTH
  );

  const hashOriginal = Buffer.from(
    hashArmazenado,
    "hex"
  );

  if (hashCalculado.length !== hashOriginal.length) {
    return false;
  }

  return timingSafeEqual(
    hashCalculado,
    hashOriginal
  );
}