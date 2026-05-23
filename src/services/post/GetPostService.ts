// src/services/post/GetPostService.ts
import prismaClient from "../../prisma";

export class GetPostService {
  // Busca todos os posts
  async getAll() {
    try {
      const posts = await prismaClient.post.findMany({
        include: {
          autor: {
            select: {
              id: true,
              nome: true,
              username: true,
              fotoPerfil: true,
            },
          },
          comentarios: true,
          curtidas: true,
        },
        orderBy: {
          dataPostagem: "desc",
        },
      });
      return posts;
    } catch (error) {
      console.error("Erro ao buscar posts:", error);
      throw new Error("Erro ao buscar posts");
    }
  }

  // Busca um post específico pelo ID
  async getById(postId: number) {
    try {
      const post = await prismaClient.post.findUnique({
        where: { id: postId },
        include: {
          autor: {
            select: {
              id: true,
              nome: true,
              username: true,
              fotoPerfil: true,
            },
          },
          comentarios: {
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
          },
          curtidas: true,
          colaboracoes: {
            include: {
              usuario: {
                select: { id: true, nome: true, username: true, fotoPerfil: true },
              },
            },
          },
        },
      });
      return post;
    } catch (error) {
      console.error("Erro ao buscar post:", error);
      throw new Error("Erro ao buscar post");
    }
  }

  // ✅ Novo método: Busca posts de um usuário específico
  async getByUsuario(usuarioId: number) {
    try {
      const posts = await prismaClient.post.findMany({
        where: { usuarioId },
        include: {
          autor: {
            select: {
              id: true,
              nome: true,
              username: true,
              fotoPerfil: true,
            },
          },
          comentarios: true,
          curtidas: true,
        },
        orderBy: {
          dataPostagem: "desc",
        },
      });

      return posts;
    } catch (error) {
      console.error("Erro ao buscar posts do usuário:", error);
      throw new Error("Erro ao buscar posts do usuário");
    }
  }
}
