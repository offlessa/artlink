import prismaClient from "../../prisma";

export class DeletePostService {
  async execute(id: number) {
    // Verifica se o post existe antes de tentar deletar
    const postExistente = await prismaClient.post.findUnique({
      where: { id },
    });

    if (!postExistente) {
      throw new Error("Post não encontrado");
    }

    // Deleta o post
    await prismaClient.post.delete({
      where: { id },
    });

    return { message: "Post deletado com sucesso" };
  }
}
