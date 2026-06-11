import prismaClient from "../../prisma";

export class UpdateMensagemService {
  async execute(
    id: number,
    novosDados: { conteudo?: string; status?: "lido" | "nao_lido"; curtida?: boolean; editado?: boolean }
  ) {
    // Verifica se a mensagem existe
    const mensagemExistente = await prismaClient.mensagem.findUnique({
      where: { id },
    });

    if (!mensagemExistente) {
      throw new Error("Mensagem não encontrada");
    }

    // Se tentando marcar como lido, verificar se o remetente permite confirmação de leitura
    if (novosDados.status === "lido") {
      const remetenteRaw = (await prismaClient.usuario.findUnique({
        where: { id: mensagemExistente.remetenteId }, select: { configuracoes: true },
      }))?.configuracoes;
      const cfgRem = remetenteRaw ? JSON.parse(remetenteRaw) : null;
      if (cfgRem?.mensagens?.confirmarLeitura === false) {
        // Remetente optou por não enviar confirmações — ainda atualiza internamente mas não é exibido
        novosDados = { ...novosDados };
      }
    }

    const data = novosDados.conteudo !== undefined
      ? { ...novosDados, editado: true }
      : novosDados;

    const mensagemAtualizada = await prismaClient.mensagem.update({
      where: { id },
      data,
    });

    return mensagemAtualizada;
  }
}
