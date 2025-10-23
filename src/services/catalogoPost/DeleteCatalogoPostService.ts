import prismaClient from "../../prisma";

export class DeleteCatalogoPostService {
  async execute(catalogoId: number, postId: number) {
    // Verifica se a relação catálogo-post existe
    const relacaoExistente = await prismaClient.catalogoPost.findUnique({
      where: {
        catalogoId_postId: { catalogoId, postId },
      },
    });

    if (!relacaoExistente) {
      throw new Error("Relação catálogo-post não encontrada");
    }

    // Deleta a relação
    await prismaClient.catalogoPost.delete({
      where: {
        catalogoId_postId: { catalogoId, postId },
      },
    });

    return { message: "Post removido do catálogo com sucesso" };
  }
}
