import {
  HttpStatusCode,
  ServiceResponse,
  createError,
  createSuccess,
} from "../../../utils/createError";
import prismaClient from "../../prisma";
import { CurtidaRequest } from "../../types/Curtida";

export class CreateCurtidaService {
  async execute({
    usuarioId,
    postId,
  }: CurtidaRequest): Promise<ServiceResponse> {
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

    try {
      const usuarioExiste = await prismaClient.usuario.findUnique({
        where: { id: usuarioId },
      });

      if (!usuarioExiste) {
        return createError("Usuário não encontrado.", HttpStatusCode.NOT_FOUND);
      }

      const postExiste = await prismaClient.post.findUnique({
        where: { id: postId },
      });

      if (!postExiste) {
        return createError("Post não encontrado.", HttpStatusCode.NOT_FOUND);
      }

      const curtidaExiste = await prismaClient.curtida.findUnique({
        where: {
          usuarioId_postId: {
            usuarioId,
            postId,
          },
        },
      });

      if (curtidaExiste) {
        return createError(
          "O usuário já curtiu este post.",
          HttpStatusCode.CONFLICT
        );
      }

      const curtida = await prismaClient.curtida.create({
        data: {
          usuarioId,
          postId,
        },
        select: {
          id: true,
          usuarioId: true,
          postId: true,
          data: true,
        },
      });

      return createSuccess(curtida);
    } catch (error) {
      console.error("Erro ao criar curtida:", error);
      return createError(
        "Erro no servidor.",
        HttpStatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }
}
