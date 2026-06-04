import { HttpStatusCode, ServiceResponse, createError, createSuccess } from "../../../utils/createError";
import prismaClient from "../../prisma";

export class GetNotificacaoService {
  async getByUsuario(usuarioId: number): Promise<ServiceResponse> {
    try {
      const notificacoes = await prismaClient.notificacao.findMany({
        where: { usuarioId },
        include: {
          remetente: { select: { id: true, nome: true, username: true, fotoPerfil: true } },
          post: { select: { id: true, titulo: true, imagem: true } },
          catalogo: { select: { id: true, nome: true } },
        },
        orderBy: { data: "desc" },
        take: 50,
      });
      return createSuccess(notificacoes);
    } catch {
      return createError("Erro no servidor.", HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  }

  async contarNaoLidas(usuarioId: number): Promise<ServiceResponse> {
    try {
      const total = await prismaClient.notificacao.count({
        where: { usuarioId, lida: false },
      });
      return createSuccess({ total });
    } catch {
      return createError("Erro no servidor.", HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  }
}
