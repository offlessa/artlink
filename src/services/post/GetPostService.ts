// src/services/post/GetPostService.ts
import prismaClient from "../../prisma";

const colaboracaoAceita = { status: "aceito" as const };

const incluirAutor = {
  select: { id: true, nome: true, username: true, fotoPerfil: true },
};

export class GetPostService {
  async getAll() {
    try {
      const posts = await prismaClient.post.findMany({
        include: {
          autor: incluirAutor,
          comentarios: true,
          curtidas: true,
          colaboracoes: {
            where: colaboracaoAceita,
            include: {
              usuario: incluirAutor,
            },
          },
        },
        orderBy: { dataPostagem: "desc" },
      });
      return posts;
    } catch (error) {
      console.error("Erro ao buscar posts:", error);
      throw new Error("Erro ao buscar posts");
    }
  }

  async getById(postId: number) {
    try {
      const post = await prismaClient.post.findUnique({
        where: { id: postId },
        include: {
          autor: incluirAutor,
          comentarios: {
            include: {
              usuario: incluirAutor,
            },
          },
          curtidas: true,
          colaboracoes: {
            where: colaboracaoAceita,
            include: {
              usuario: incluirAutor,
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

  async getFeed(usuarioId: number) {
    try {
      const seguindo = await prismaClient.seguidor.findMany({
        where: { seguidorId: usuarioId },
        select: { seguidoId: true },
      });
      const idsQueSeguem = seguindo.map(s => s.seguidoId);

      const posts = await prismaClient.post.findMany({
        where: { usuarioId: { in: idsQueSeguem } },
        include: {
          autor: incluirAutor,
          comentarios: true,
          curtidas: true,
          colaboracoes: {
            where: colaboracaoAceita,
            include: { usuario: incluirAutor },
          },
        },
        orderBy: { dataPostagem: "desc" },
      });
      return posts;
    } catch (error) {
      console.error("Erro ao buscar feed:", error);
      throw new Error("Erro ao buscar feed");
    }
  }

  async isContaPrivada(usuarioId: number): Promise<boolean> {
    const u = await prismaClient.usuario.findUnique({ where: { id: usuarioId }, select: { configuracoes: true } });
    if (!u?.configuracoes) return false;
    try { return JSON.parse(u.configuracoes)?.privacidade?.contaPrivada === true; } catch { return false; }
  }

  async getByUsuario(usuarioId: number, solicitanteId?: number) {
    try {
      // Conta privada: só o próprio usuário e seguidores veem os posts
      if (solicitanteId !== undefined && solicitanteId !== usuarioId) {
        const privada = await this.isContaPrivada(usuarioId);
        if (privada) {
          const segue = await prismaClient.seguidor.findUnique({
            where: { seguidorId_seguidoId: { seguidorId: solicitanteId, seguidoId: usuarioId } },
          });
          if (!segue) return [];
        }
      }

      const posts = await prismaClient.post.findMany({
        where: { usuarioId },
        include: {
          autor: incluirAutor,
          comentarios: true,
          curtidas: true,
          colaboracoes: {
            where: colaboracaoAceita,
            include: { usuario: incluirAutor },
          },
        },
        orderBy: { dataPostagem: "desc" },
      });
      return posts;
    } catch (error) {
      console.error("Erro ao buscar posts do usuário:", error);
      throw new Error("Erro ao buscar posts do usuário");
    }
  }
}
