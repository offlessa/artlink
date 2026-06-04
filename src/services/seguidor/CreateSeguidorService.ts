import { HttpStatusCode, ServiceResponse, createError, createSuccess } from "../../../utils/createError";
import prismaClient from "../../prisma";
import { criarNotificacao } from "../../../utils/criarNotificacao";

export class CreateSeguidorService {
  async execute({ seguidorId, seguidoId }: { seguidorId: number; seguidoId: number }): Promise<ServiceResponse> {
    if (!seguidorId || !seguidoId) {
      return createError("seguidorId e seguidoId são obrigatórios.", HttpStatusCode.BAD_REQUEST);
    }
    if (seguidorId === seguidoId) {
      return createError("Usuário não pode seguir a si mesmo.", HttpStatusCode.BAD_REQUEST);
    }

    try {
      const existe = await prismaClient.seguidor.findUnique({
        where: { seguidorId_seguidoId: { seguidorId, seguidoId } },
      });
      if (existe) {
        return createError("Já está seguindo este usuário.", HttpStatusCode.CONFLICT);
      }

      const seguidor = await prismaClient.seguidor.create({
        data: { seguidorId, seguidoId },
      });

      // criar notificação
      await criarNotificacao({ usuarioId: seguidoId, remetenteId: seguidorId, tipo: "seguindo" });

      return createSuccess(seguidor);
    } catch (error) {
      console.error("Erro ao seguir:", error);
      return createError("Erro no servidor.", HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  }
}
