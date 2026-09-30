export class ErroRequisicao extends Error {
  status: number;
  constructor(mensagem: string, status: number) {
    super(mensagem);
    this.status = status;
  }
}

// Limita também corpos sem Content-Length, antes de acumulá-los na memória.
export async function lerJson(request: Request, limiteBytes = 128 * 1024): Promise<unknown> {
  const tipo = request.headers.get("content-type")?.split(";")[0].trim().toLowerCase();
  if (tipo !== "application/json") {
    throw new ErroRequisicao("Envie os dados no formato JSON.", 415);
  }
  const tamanho = request.headers.get("content-length");
  if (tamanho && Number(tamanho) > limiteBytes) {
    throw new ErroRequisicao("Os dados enviados são muito grandes.", 413);
  }
  if (!request.body) throw new ErroRequisicao("Envie os dados do formulário.", 400);

  const leitor = request.body.getReader();
  const partes: Uint8Array[] = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await leitor.read();
      if (done) break;
      total += value.byteLength;
      if (total > limiteBytes) {
        await leitor.cancel();
        throw new ErroRequisicao("Os dados enviados são muito grandes.", 413);
      }
      partes.push(value);
    }
    return JSON.parse(Buffer.concat(partes).toString("utf8"));
  } catch (error) {
    if (error instanceof ErroRequisicao) throw error;
    throw new ErroRequisicao("Os dados enviados estão incompletos ou inválidos.", 400);
  } finally {
    leitor.releaseLock();
  }
}
