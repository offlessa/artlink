import prismaClient from "../../prisma";

export class UpdateCurtidaService {
  async execute(id: number, novoPostId: number) {
    const curtidaExistente = await prismaClient.curtida.findUnique({
      where: { id },
    });

    if (!curtidaExistente) {
      throw new Error("Curtida não encontrada");
    }

    const curtidaAtualizada = await prismaClient.curtida.update({
      where: { id },
      data: { postId: novoPostId },
    });

    return curtidaAtualizada;
  }
}
