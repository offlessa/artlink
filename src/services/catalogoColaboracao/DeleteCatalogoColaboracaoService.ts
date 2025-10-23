import prismaClient from "../../prisma";

export class DeleteCatalogoColaboracaoService {
  async execute(catalogoId: number, usuarioId: number) {
    // Verifica se a colaboração existe
    const colaboracaoExistente =
      await prismaClient.catalogoColaboracao.findUnique({
        where: {
          catalogoId_usuarioId: { catalogoId, usuarioId },
        },
      });

    if (!colaboracaoExistente) {
      throw new Error("Colaboração não encontrada");
    }

    // Deleta a colaboração
    await prismaClient.catalogoColaboracao.delete({
      where: {
        catalogoId_usuarioId: { catalogoId, usuarioId },
      },
    });

    return { message: "Colaboração deletada com sucesso" };
  }
}
