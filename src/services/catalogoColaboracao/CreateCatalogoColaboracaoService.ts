import {
  HttpStatusCode,
  ServiceResponse,
  createError,
  createSuccess,
} from "../../../utils/createError";
import prismaClient from "../../prisma";
import { CatalogoColaboracaoRequest } from "../../types/CatalogoColaboracao";

export class CreateCatalogoColaboracaoService {
  async execute({
    catalogoId,
    usuarioId,
  }: CatalogoColaboracaoRequest): Promise<ServiceResponse> {
    if (!catalogoId || isNaN(catalogoId)) {
      return createError(
        "Parâmetro catalogoId é obrigatório e deve ser numérico.",
        HttpStatusCode.BAD_REQUEST
      );
    }

    if (!usuarioId || isNaN(usuarioId)) {
      return createError(
        "Parâmetro usuarioId é obrigatório e deve ser numérico.",
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

      const usuarioExiste = await prismaClient.usuario.findUnique({
        where: { id: usuarioId },
      });

      if (!usuarioExiste) {
        return createError("Usuário não encontrado.", HttpStatusCode.NOT_FOUND);
      }

      const colaboracaoExiste =
        await prismaClient.catalogoColaboracao.findUnique({
          where: {
            catalogoId_usuarioId: {
              catalogoId,
              usuarioId,
            },
          },
        });

      if (colaboracaoExiste) {
        return createError(
          "Esta colaboração já existe.",
          HttpStatusCode.CONFLICT
        );
      }

      const colaboracao = await prismaClient.catalogoColaboracao.create({
        data: {
          catalogoId,
          usuarioId,
        },
      });

      return createSuccess(colaboracao);
    } catch (error) {
      console.error("Erro ao criar colaboração de catálogo:", error);
      return createError(
        "Erro no servidor.",
        HttpStatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }
}
