import { HttpStatusCode, ServiceResponse, createError, createSuccess } from "../../../utils/createError";
import prismaClient from "../../prisma";

export class DeleteSeguidorService {
  async execute({ seguidorId, seguidoId }: { seguidorId: number; seguidoId: number }): Promise<ServiceResponse> {
    if (!seguidorId || !seguidoId) {
      return createError("seguidorId e seguidoId são obrigatórios.", HttpStatusCode.BAD_REQUEST);
    }

    try {
      const existe = await prismaClient.seguidor.findUnique({
        where: { seguidorId_seguidoId: { seguidorId, seguidoId } },
      });
      if (!existe) {
        return createError("Você não está seguindo este usuário.", HttpStatusCode.NOT_FOUND);
      }

      await prismaClient.seguidor.delete({
        where: { seguidorId_seguidoId: { seguidorId, seguidoId } },
      });

      return createSuccess({ seguidorId, seguidoId });
    } catch (error) {
      console.error("Erro ao deixar de seguir:", error);
      return createError("Erro no servidor.", HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  }
}
