import prismaClient from "../../prisma";

export class GetCatalogoPostService {
  async getByCatalogo(catalogoId: number) {
    try {
      const catalogoPosts = await prismaClient.catalogoPost.findMany({
        where: { catalogoId },
        include: {
          post: {
            include: {
              autor: {
                select: {
                  id: true,
                  nome: true,
                  username: true,
                  fotoPerfil: true,
                },
              },
            },
          },
        },
      });

      const posts = catalogoPosts.map((cp) => cp.post);

      return posts;
    } catch (error) {
      console.error("Erro ao buscar posts do catálogo:", error);
      throw new Error("Erro ao buscar posts do catálogo");
    }
  }
}
