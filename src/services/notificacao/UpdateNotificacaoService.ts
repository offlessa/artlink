import { HttpStatusCode, ServiceResponse, createError, createSuccess } from "../../../utils/createError";
import prismaClient from "../../prisma";

export class UpdateNotificacaoService {
  async marcarTodasLidas(usuarioId: number): Promise<ServiceResponse> {
    try {
      await prismaClient.notificacao.updateMany({
        where: { usuarioId, lida: false, tipo: { not: "colaboracao" } },
        data: { lida: true },
      });
      return createSuccess({ ok: true });
    } catch {
      return createError("Erro no servidor.", HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  }
}
