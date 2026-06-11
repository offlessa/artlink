import { HttpStatusCode, ServiceResponse, createError, createSuccess } from "../../../utils/createError";
import prismaClient from "../../prisma";

export class DeleteNotificacaoService {
  async deletarUma(id: number): Promise<ServiceResponse> {
    try {
      await prismaClient.notificacao.delete({ where: { id } });
      return createSuccess({ message: "Notificação removida" });
    } catch {
      return createError("Erro no servidor.", HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  }

  async deletarTodas(usuarioId: number): Promise<ServiceResponse> {
    try {
      await prismaClient.notificacao.deleteMany({ where: { usuarioId } });
      return createSuccess({ message: "Histórico limpo" });
    } catch {
      return createError("Erro no servidor.", HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  }
}
