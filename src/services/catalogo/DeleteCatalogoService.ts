import prismaClient from "../../prisma";

export class DeleteCatalogoService {
  async execute(id: number) {
    // Verifica se o catálogo existe
    const catalogoExistente = await prismaClient.catalogo.findUnique({
      where: { id },
    });

    if (!catalogoExistente) {
      throw new Error("Catálogo não encontrado");
    }

    // Deleta o catálogo
    await prismaClient.catalogo.delete({
      where: { id },
    });

    return { message: "Catálogo deletado com sucesso" };
  }
}
