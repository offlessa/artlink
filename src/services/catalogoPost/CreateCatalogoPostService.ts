import {
  HttpStatusCode,
  ServiceResponse,
  createError,
  createSuccess,
} from "../../../utils/createError";
import prismaClient from "../../prisma";
import { CatalogoPostRequest } from "../../types/CatalogoPost";

export class CreateCatalogoPostService {
  async execute({
    catalogoId,
    postId,
  }: CatalogoPostRequest): Promise<ServiceResponse> {
    if (!catalogoId || isNaN(catalogoId)) {
      return createError(
        "Parâmetro catalogoId é obrigatório e deve ser numérico.",
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
      const catalogoExiste = await prismaClient.catalogo.findUnique({
        where: { id: catalogoId },
      });

      if (!catalogoExiste) {
        return createError(
          "Catálogo não encontrado.",
          HttpStatusCode.NOT_FOUND
        );
      }

      const postExiste = await prismaClient.post.findUnique({
        where: { id: postId },
      });

      if (!postExiste) {
        return createError("Post não encontrado.", HttpStatusCode.NOT_FOUND);
      }

      const catalogoPostExiste = await prismaClient.catalogoPost.findUnique({
        where: {
          catalogoId_postId: {
            catalogoId,
            postId,
          },
        },
      });

      if (catalogoPostExiste) {
        return createError(
          "Este post já está adicionado ao catálogo.",
          HttpStatusCode.CONFLICT
        );
      }

      const catalogoPost = await prismaClient.catalogoPost.create({
        data: { catalogoId, postId },
      });

      return createSuccess(catalogoPost);
    } catch (error) {
      console.error("Erro ao adicionar post ao catálogo:", error);
      return createError(
        "Erro no servidor.",
        HttpStatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }
}
