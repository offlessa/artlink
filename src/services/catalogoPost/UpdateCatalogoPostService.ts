import prismaClient from "../../prisma";
import { CatalogoPostRequest } from "../../types/CatalogoPost";

export class UpdateCatalogoPostService {
  async execute(catalogoId: number, posts: CatalogoPostRequest[]) {
    // Confirma que o catálogo existe
    const catalogoExistente = await prismaClient.catalogo.findUnique({
      where: { id: catalogoId },
    });

    if (!catalogoExistente) {
      throw new Error("Catálogo não encontrado");
    }

    // Remove todos os posts antigos do catálogo
    await prismaClient.catalogoPost.deleteMany({
      where: { catalogoId },
    });

    // Cria os novos posts para o catálogo
    const catalogoPosts = posts.map((p) => ({
      catalogoId,
      postId: p.postId,
    }));

    const resultado = await prismaClient.catalogoPost.createMany({
      data: catalogoPosts,
      skipDuplicates: true,
    });

    return resultado;
  }
}
