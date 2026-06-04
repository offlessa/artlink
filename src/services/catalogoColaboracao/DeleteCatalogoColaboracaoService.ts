import prismaClient from "../../prisma";

export class DeleteCatalogoColaboracaoService {
  async execute(catalogoId: number, usuarioId: number) {
    const colaboracao = await prismaClient.catalogoColaboracao.findUnique({
      where: { catalogoId_usuarioId: { catalogoId, usuarioId } },
    });
    if (!colaboracao) throw new Error("Colaboração não encontrada");

    // Remove posts do colaborador que saiu
    const postsDele = await prismaClient.catalogoPost.findMany({
      where: { catalogoId },
      include: { post: { select: { usuarioId: true } } },
    });
    const idsRemover = postsDele
      .filter(cp => cp.post.usuarioId === usuarioId)
      .map(cp => cp.postId);

    if (idsRemover.length > 0) {
      await prismaClient.catalogoPost.deleteMany({
        where: { catalogoId, postId: { in: idsRemover } },
      });
    }

    await prismaClient.catalogoColaboracao.delete({
      where: { catalogoId_usuarioId: { catalogoId, usuarioId } },
    });

    return { message: "Colaboração removida com sucesso" };
  }
}
