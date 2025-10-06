import {
  HttpStatusCode,
  ServiceResponse,
  createError,
  createSuccess,
} from "../../../utils/createError";
import prismaClient from "../../prisma";
import { ComentarioRequest } from "../../types/Comentario";

export class CreateComentarioService {
  async execute({
    usuarioId,
    postId,
    conteudo,
  }: ComentarioRequest): Promise<ServiceResponse> {
    if (!usuarioId || isNaN(usuarioId)) {
      return createError(
        "Parâmetro usuarioId é obrigatório e deve ser numérico.",
        HttpStatusCode.BAD_REQUEST
      );
    }

    if (!postId || isNaN(postId)) {
      return createError(
        "Parâmetro postId é obrigatório e deve ser numérico.",
        HttpStatusCode.BAD_REQUEST
      );
    }

    if (!conteudo || conteudo.trim().length === 0) {
      return createError(
        "Parâmetro conteudo é obrigatório.",
        HttpStatusCode.BAD_REQUEST
      );
    }

    try {
      const usuarioExiste = await prismaClient.usuario.findUnique({
        where: { id: usuarioId },
      });

      if (!usuarioExiste) {
        return createError("Usuário não encontrado.", HttpStatusCode.NOT_FOUND);
      }

      // Verifica se o post existe
      const postExiste = await prismaClient.post.findUnique({
        where: { id: postId },
      });

      if (!postExiste) {
        return createError("Post não encontrado.", HttpStatusCode.NOT_FOUND);
      }

      const comentario = await prismaClient.comentario.create({
        data: {
          usuarioId,
          postId,
          conteudo: conteudo.trim(),
        },
        select: {
          id: true,
          usuarioId: true,
          postId: true,
          conteudo: true,
          data: true,
        },
      });

      return createSuccess(comentario);
    } catch (error) {
      console.error("Erro ao criar comentário:", error);
      return createError(
        "Erro no servidor.",
        HttpStatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }
}
