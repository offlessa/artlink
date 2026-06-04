import {
  HttpStatusCode,
  ServiceResponse,
  createError,
  createSuccess,
} from "../../../utils/createError";
import prismaClient from "../../prisma";

export class RespostaCatalogoColaboracaoService {
  async aceitar(catalogoId: number, usuarioId: number): Promise<ServiceResponse> {
    try {
      const colaboracao = await prismaClient.catalogoColaboracao.findUnique({
        where: { catalogoId_usuarioId: { catalogoId, usuarioId } },
      });
      if (!colaboracao) {
        return createError("Convite não encontrado.", HttpStatusCode.NOT_FOUND);
      }
      if (colaboracao.status !== "pendente") {
        return createError("Este convite já foi respondido.", HttpStatusCode.CONFLICT);
      }

      const atualizado = await prismaClient.catalogoColaboracao.update({
        where: { catalogoId_usuarioId: { catalogoId, usuarioId } },
        data: { status: "aceito" },
      });

      await prismaClient.notificacao.deleteMany({
        where: { usuarioId, catalogoId, tipo: "colaboracao_catalogo" },
      });

      return createSuccess(atualizado);
    } catch (error) {
      console.error("Erro ao aceitar colaboração de catálogo:", error);
      return createError("Erro no servidor.", HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  }

  async recusar(catalogoId: number, usuarioId: number): Promise<ServiceResponse> {
    try {
      const colaboracao = await prismaClient.catalogoColaboracao.findUnique({
        where: { catalogoId_usuarioId: { catalogoId, usuarioId } },
        include: {
          catalogo: {
            include: {
              posts: {
                include: { post: { select: { usuarioId: true } } },
              },
            },
          },
        },
      });
      if (!colaboracao) {
        return createError("Convite não encontrado.", HttpStatusCode.NOT_FOUND);
      }
      if (colaboracao.status !== "pendente") {
        return createError("Este convite já foi respondido.", HttpStatusCode.CONFLICT);
      }

      // Remove posts do usuário que recusou
      const postsDele = colaboracao.catalogo.posts
        .filter(cp => cp.post.usuarioId === usuarioId)
        .map(cp => cp.postId);

      if (postsDele.length > 0) {
        await prismaClient.catalogoPost.deleteMany({
          where: { catalogoId, postId: { in: postsDele } },
        });
      }

      await prismaClient.catalogoColaboracao.delete({
        where: { catalogoId_usuarioId: { catalogoId, usuarioId } },
      });

      await prismaClient.notificacao.deleteMany({
        where: { usuarioId, catalogoId, tipo: "colaboracao_catalogo" },
      });

      return createSuccess({ message: "Convite recusado." });
    } catch (error) {
      console.error("Erro ao recusar colaboração de catálogo:", error);
      return createError("Erro no servidor.", HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  }
}
