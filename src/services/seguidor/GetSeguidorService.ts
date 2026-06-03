import { HttpStatusCode, ServiceResponse, createError, createSuccess } from "../../../utils/createError";
import prismaClient from "../../prisma";

export class GetSeguidorService {
  async getSeguidores(usuarioId: number): Promise<ServiceResponse> {
    try {
      const seguidores = await prismaClient.seguidor.findMany({
        where: { seguidoId: usuarioId },
        include: {
          seguidor: { select: { id: true, nome: true, username: true, fotoPerfil: true } },
        },
        orderBy: { data: "desc" },
      });
      return createSuccess(seguidores.map(s => s.seguidor));
    } catch {
      return createError("Erro no servidor.", HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  }

  async getSeguindo(usuarioId: number): Promise<ServiceResponse> {
    try {
      const seguindo = await prismaClient.seguidor.findMany({
        where: { seguidorId: usuarioId },
        include: {
          seguido: { select: { id: true, nome: true, username: true, fotoPerfil: true } },
        },
        orderBy: { data: "desc" },
      });
      return createSuccess(seguindo.map(s => s.seguido));
    } catch {
      return createError("Erro no servidor.", HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  }

  async getContadores(usuarioId: number): Promise<ServiceResponse> {
    try {
      const [seguidores, seguindo] = await Promise.all([
        prismaClient.seguidor.count({ where: { seguidoId: usuarioId } }),
        prismaClient.seguidor.count({ where: { seguidorId: usuarioId } }),
      ]);
      return createSuccess({ seguidores, seguindo });
    } catch {
      return createError("Erro no servidor.", HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  }

  async checarSeguindo(seguidorId: number, seguidoId: number): Promise<ServiceResponse> {
    try {
      const existe = await prismaClient.seguidor.findUnique({
        where: { seguidorId_seguidoId: { seguidorId, seguidoId } },
      });
      return createSuccess({ seguindo: !!existe });
    } catch {
      return createError("Erro no servidor.", HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  }
}
