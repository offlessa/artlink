import {
  HttpStatusCode,
  ServiceResponse,
  createError,
  createSuccess,
} from "../../../utils/createError";
import prismaClient from "../../prisma";
import { CatalogoColaboracaoRequest } from "../../types/CatalogoColaboracao";
import { criarNotificacao } from "../../../utils/criarNotificacao";

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
      const catalogo = await prismaClient.catalogo.findUnique({
        where: { id: catalogoId },
      });
      if (!catalogo) {
        return createError("Catálogo não encontrado.", HttpStatusCode.NOT_FOUND);
      }

      if (catalogo.usuarioId === usuarioId) {
        return createError(
          "O dono do catálogo não pode ser convidado como colaborador.",
          HttpStatusCode.BAD_REQUEST
        );
      }

      const usuario = await prismaClient.usuario.findUnique({
        where: { id: usuarioId },
      });
      if (!usuario) {
        return createError("Usuário não encontrado.", HttpStatusCode.NOT_FOUND);
      }

      // Checar config de privacidade do convidado
      const cfgConvidadoRaw = (await prismaClient.usuario.findUnique({
        where: { id: usuarioId }, select: { configuracoes: true },
      }))?.configuracoes;
      const cfgConv = cfgConvidadoRaw ? JSON.parse(cfgConvidadoRaw) : null;
      const quemPodeConvidar = cfgConv?.privacidade?.quemPodeConvidar ?? "todos";
      if (quemPodeConvidar === "seguidos") {
        const convidadoSegueDono = await prismaClient.seguidor.findUnique({
          where: { seguidorId_seguidoId: { seguidorId: usuarioId, seguidoId: catalogo.usuarioId } },
        });
        if (!convidadoSegueDono) {
          return createError("Este usuário só aceita convites de quem segue.", HttpStatusCode.FORBIDDEN);
        }
      }

      const existente = await prismaClient.catalogoColaboracao.findUnique({
        where: { catalogoId_usuarioId: { catalogoId, usuarioId } },
      });
      if (existente) {
        return createError("Este convite já foi enviado.", HttpStatusCode.CONFLICT);
      }

      const colaboracao = await prismaClient.catalogoColaboracao.create({
        data: { catalogoId, usuarioId, status: "pendente" },
      });

      await criarNotificacao({ usuarioId, remetenteId: catalogo.usuarioId, tipo: "colaboracao_catalogo", catalogoId });

      return createSuccess(colaboracao);
    } catch (error) {
      console.error("Erro ao criar colaboração de catálogo:", error);
      return createError("Erro no servidor.", HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  }
}
