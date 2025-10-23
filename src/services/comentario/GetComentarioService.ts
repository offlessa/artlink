import prismaClient from "../../prisma";

export class GetComentarioService {
  // Buscar todos os comentários de um post
  async getByPost(postId: number) {
    try {
      const comentarios = await prismaClient.comentario.findMany({
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
        orderBy: {
          data: "asc", // ordena do mais antigo para o mais recente
        },
      });

      return comentarios;
    } catch (error) {
      console.error("Erro ao buscar comentários:", error);
      throw new Error("Erro ao buscar comentários do post");
    }
  }

  // Buscar um comentário específico pelo ID
  async getById(id: number) {
    const comentario = await prismaClient.comentario.findUnique({
      where: { id },
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

    return comentario;
  }
}
