import {
  HttpStatusCode,
  ServiceResponse,
  createError,
  createSuccess,
} from "../../../utils/createError";
import prismaClient from "../../prisma";
import { PostRequest } from "../../types/Post";

export class CreatePostService {
  async execute({
    usuarioId,
    titulo,
    descricao,
    imagem,
  }: PostRequest): Promise<ServiceResponse> {
    if (!usuarioId) {
      return createError(
        "Parâmetro autor é obrigatório.",
        HttpStatusCode.BAD_REQUEST
      );
    }

    if (!titulo || titulo.trim().length === 0) {
      return createError(
        "Parâmetro titulo é obrigatório.",
        HttpStatusCode.BAD_REQUEST
      );
    }

    if (titulo.length > 150) {
      return createError(
        "Título não pode exceder 150 caracteres.",
        HttpStatusCode.BAD_REQUEST
      );
    }

    if (descricao && descricao.length > 1000) {
      return createError(
        "Descrição não pode exceder 1000 caracteres.",
        HttpStatusCode.BAD_REQUEST
      );
    }

    try {
      const usuarioExists = await prismaClient.usuario.findUnique({
        where: { id: usuarioId },
      });

      if (!usuarioExists) {
        return createError("Usuário não encontrado.", HttpStatusCode.NOT_FOUND);
      }

      const post = await prismaClient.post.create({
        data: {
          usuarioId,
          titulo: titulo.trim(),
          descricao: descricao?.trim() || null,
          imagem: imagem?.trim() || null,
        },
        select: {
          id: true,
          usuarioId: true,
          titulo: true,
          descricao: true,
          imagem: true,
          dataPostagem: true,
        },
      });

      return createSuccess(post);
    } catch (error) {
      console.error("Erro ao criar post:", error);
      return createError(
        "Erro no servidor.",
        HttpStatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }
}
