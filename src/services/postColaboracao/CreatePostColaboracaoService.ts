import {
  HttpStatusCode,
  ServiceResponse,
  createError,
  createSuccess,
} from "../../../utils/createError";
import prismaClient from "../../prisma";
import { PostColaboracaoRequest } from "../../types/PostColaboracao";

export class CreatePostColaboracaoService {
  async execute({
    postId,
    usuarioId,
  }: PostColaboracaoRequest): Promise<ServiceResponse> {
    if (!postId) {
      return createError(
        "Parâmetro postId é obrigatório.",
        HttpStatusCode.BAD_REQUEST
      );
    }

    if (!usuarioId) {
      return createError(
        "Parâmetro usuarioId é obrigatório.",
        HttpStatusCode.BAD_REQUEST
      );
    }

    try {
      const postExists = await prismaClient.post.findUnique({
        where: { id: postId },
      });

      if (!postExists) {
        return createError("Post não encontrado.", HttpStatusCode.NOT_FOUND);
      }

      const usuarioExists = await prismaClient.usuario.findUnique({
        where: { id: usuarioId },
      });

      if (!usuarioExists) {
        return createError("Usuário não encontrado.", HttpStatusCode.NOT_FOUND);
      }

      const colaboracaoExists = await prismaClient.postColaboracao.findUnique({
        where: {
          postId_usuarioId: {
            postId,
            usuarioId,
          },
        },
      });

      if (colaboracaoExists) {
        return createError(
          "Este usuário já é colaborador deste post.",
          HttpStatusCode.CONFLICT
        );
      }

      const colaboracao = await prismaClient.postColaboracao.create({
        data: {
          postId,
          usuarioId,
        },
        select: {
          postId: true,
          usuarioId: true,
          post: {
            select: { id: true, titulo: true },
          },
          usuario: {
            select: { id: true, nome: true, username: true },
          },
        },
      });

      return createSuccess(colaboracao);
    } catch (error) {
      console.error("Erro ao criar colaboração:", error);
      return createError(
        "Erro no servidor.",
        HttpStatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }
}
