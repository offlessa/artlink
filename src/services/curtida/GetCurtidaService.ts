import prismaClient from "../../prisma";

export class GetCurtidaService {
  // Buscar todas as curtidas de um post
  async getByPost(postId: number) {
    try {
      const curtidas = await prismaClient.curtida.findMany({
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

      return curtidas;
    } catch (error) {
      console.error("Erro ao buscar curtidas:", error);
      throw new Error("Erro ao buscar curtidas do post");
    }
  }

  // Buscar todas as curtidas de um usuário
  async getByUsuario(usuarioId: number) {
    try {
      const curtidas = await prismaClient.curtida.findMany({
        where: { usuarioId },
        include: {
          post: true, // pode incluir mais detalhes do post se quiser
        },
      });

      return curtidas;
    } catch (error) {
      console.error("Erro ao buscar curtidas do usuário:", error);
      throw new Error("Erro ao buscar curtidas do usuário");
    }
  }
}
