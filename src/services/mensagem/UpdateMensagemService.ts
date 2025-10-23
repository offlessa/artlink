import prismaClient from "../../prisma";

export class UpdateMensagemService {
  async execute(
    id: number,
    novosDados: { conteudo?: string; status?: "lido" | "nao_lido" }
  ) {
    // Verifica se a mensagem existe
    const mensagemExistente = await prismaClient.mensagem.findUnique({
      where: { id },
    });

    if (!mensagemExistente) {
      throw new Error("Mensagem não encontrada");
    }

    // Atualiza os campos fornecidos
    const mensagemAtualizada = await prismaClient.mensagem.update({
      where: { id },
      data: novosDados,
    });

    return mensagemAtualizada;
  }
}
