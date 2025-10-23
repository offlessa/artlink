import prismaClient from "../../prisma";

export class DeleteMensagemService {
  async execute(id: number) {
    // Verifica se a mensagem existe
    const mensagemExistente = await prismaClient.mensagem.findUnique({
      where: { id },
    });

    if (!mensagemExistente) {
      throw new Error("Mensagem não encontrada");
    }

    // Deleta a mensagem
    await prismaClient.mensagem.delete({
      where: { id },
    });

    return { message: "Mensagem deletada com sucesso" };
  }
}
