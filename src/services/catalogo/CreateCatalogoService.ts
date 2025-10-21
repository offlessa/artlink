import {
  HttpStatusCode,
  ServiceResponse,
  createError,
  createSuccess,
} from "../../../utils/createError";
import prismaClient from "../../prisma";
import { CatalogoRequest } from "../../types/Catalogo";

export class CreateCatalogoService {
  async execute({
    usuarioId,
    nome,
    descricao,
  }: CatalogoRequest): Promise<ServiceResponse> {
    if (!usuarioId || isNaN(usuarioId)) {
      return createError(
        "Parâmetro usuarioId é obrigatório e deve ser numérico.",
        HttpStatusCode.BAD_REQUEST
      );
    }

    if (!nome || nome.trim() === "") {
      return createError(
        "O campo nome é obrigatório.",
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

      const catalogo = await prismaClient.catalogo.create({
        data: {
          usuarioId,
          nome,
          ...(descricao ? { descricao } : {}),
        },
      });

      return createSuccess(catalogo);
    } catch (error) {
      console.error("Erro ao criar catálogo:", error);
      return createError(
        "Erro no servidor.",
        HttpStatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }
}
