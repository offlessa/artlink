import prismaClient from "../../prisma";

export class DeleteComentarioService {
  async execute(id: number) {
    // Verifica se o comentário existe
    const comentarioExistente = await prismaClient.comentario.findUnique({
      where: { id },
    });

    if (!comentarioExistente) {
      throw new Error("Comentário não encontrado");
    }

    // Deleta o comentário
    await prismaClient.comentario.delete({
      where: { id },
    });

    return { message: "Comentário deletado com sucesso" };
  }
}
