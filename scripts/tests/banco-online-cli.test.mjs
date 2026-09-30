import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";

const script = fileURLToPath(new URL("../verificar-banco-online.mjs", import.meta.url));

test("comando inicia no Node e identifica falhas sem expor credenciais nem acessar a rede", () => {
  const dir = mkdtempSync(path.join(os.tmpdir(), "guia-tech-cli-"));
  const segredo = "token-ficticio-que-nao-deve-aparecer";
  const casos = [
    { args: [], env: {}, mensagem: /Uso: npm run banco:verificar-online/ },
    { args: ["ausente.db"], env: {}, mensagem: /configuração privada/ },
    { args: ["ausente.db"], env: { GUIA_DATABASE_MODE: "turso", TURSO_DATABASE_URL: `https://usuario:${segredo}@example.invalid`, TURSO_AUTH_TOKEN: segredo }, mensagem: /configuração privada/ },
    { args: ["ausente.db"], env: { GUIA_DATABASE_MODE: "turso", TURSO_DATABASE_URL: "https://example.invalid", TURSO_AUTH_TOKEN: segredo }, mensagem: /backup local e manifesto/ },
  ];
  try {
    for (const caso of casos) {
      const result = spawnSync(process.execPath, [script, ...caso.args], {
        cwd: dir,
        env: { ...process.env, NODE_NO_WARNINGS: "1", GUIA_DATABASE_MODE: "sqlite", TURSO_DATABASE_URL: "", TURSO_AUTH_TOKEN: "", GUIA_TURSO_WRITE_ENABLED: "0", ...caso.env },
        encoding: "utf8",
        timeout: 15000,
        windowsHide: true,
      });
      assert.equal(result.error, undefined);
      assert.equal(result.status, 1);
      assert.match(result.stderr, caso.mensagem);
      assert.doesNotMatch(result.stdout + result.stderr, new RegExp(segredo));
      assert.doesNotMatch(result.stderr, /SyntaxError|Named export/);
    }
  } finally {
    assert.equal(path.dirname(dir), os.tmpdir());
    assert.ok(path.basename(dir).startsWith("guia-tech-cli-"));
    rmSync(dir, { recursive: true, force: true });
  }
});
