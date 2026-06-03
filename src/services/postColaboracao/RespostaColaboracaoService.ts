import {
  HttpStatusCode,
  ServiceResponse,
  createError,
  createSuccess,
} from "../../../utils/createError";
import prismaClient from "../../prisma";

export class RespostaColaboracaoService {
  async aceitar(postId: number, usuarioId: number): Promise<ServiceResponse> {
    try {
      const colaboracao = await prismaClient.postColaboracao.findUnique({
        where: { postId_usuarioId: { postId, usuarioId } },
      });

      if (!colaboracao) {
        return createError("Convite de colaboração não encontrado.", HttpStatusCode.NOT_FOUND);
      }

      if (colaboracao.status !== "pendente") {
        return createError("Este convite já foi respondido.", HttpStatusCode.CONFLICT);
      }

      const atualizado = await prismaClient.postColaboracao.update({
        where: { postId_usuarioId: { postId, usuarioId } },
        data: { status: "aceito" },
        select: {
          postId: true,
          usuarioId: true,
          status: true,
          post: { select: { id: true, titulo: true } },
          usuario: { select: { id: true, nome: true, username: true } },
        },
      });

      // Remove a notificação de convite (já foi respondida)
      await prismaClient.notificacao.deleteMany({
        where: { usuarioId, postId, tipo: "colaboracao" },
      });

      return createSuccess(atualizado);
    } catch (error) {
      console.error("Erro ao aceitar colaboração:", error);
      return createError("Erro no servidor.", HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  }

  async recusar(postId: number, usuarioId: number): Promise<ServiceResponse> {
    try {
      const colaboracao = await prismaClient.postColaboracao.findUnique({
        where: { postId_usuarioId: { postId, usuarioId } },
      });

      if (!colaboracao) {
        return createError("Convite de colaboração não encontrado.", HttpStatusCode.NOT_FOUND);
      }

      if (colaboracao.status !== "pendente") {
        return createError("Este convite já foi respondido.", HttpStatusCode.CONFLICT);
      }

      await prismaClient.postColaboracao.delete({
        where: { postId_usuarioId: { postId, usuarioId } },
      });

      // Remove a notificação de convite (já foi respondida)
      await prismaClient.notificacao.deleteMany({
        where: { usuarioId, postId, tipo: "colaboracao" },
      });

      return createSuccess({ message: "Convite recusado." });
    } catch (error) {
      console.error("Erro ao recusar colaboração:", error);
      return createError("Erro no servidor.", HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  }
}
