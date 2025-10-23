import prismaClient from "../../prisma";

export class GetPostColaboracaoService {
  async getByUsuario(usuarioId: number) {
    try {
      const colaboracoes = await prismaClient.postColaboracao.findMany({
        where: { usuarioId },
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

      const posts = colaboracoes.map((c) => c.post);

      return posts;
    } catch (error) {
      console.error("Erro ao buscar posts de colaboração:", error);
      throw new Error("Erro ao buscar posts de colaboração");
    }
  }

  async getByPost(postId: number) {
    try {
      const colaboracoes = await prismaClient.postColaboracao.findMany({
        where: { postId },
        include: {
          usuario: {
            select: {
              id: true,
              nome: true,
              username: true,
              fotoPerfil: true,
            },
          },
        },
      });

      return colaboracoes;
    } catch (error) {
      console.error("Erro ao buscar colaboradores do post:", error);
      throw new Error("Erro ao buscar colaboradores do post");
    }
  }
}
