import prismaClient from "../../prisma";
import {
  HttpStatusCode, ServiceResponse, createError, createSuccess,
} from "../../../utils/createError";

export class ConversaConfigService {
  async aceitarSolicitacao(usuarioId: number, outroId: number): Promise<ServiceResponse> {
    try {
      // Marcar como normal para os dois lados
      await Promise.all([
        prismaClient.conversaConfig.upsert({
          where: { usuarioId_outroUsuarioId: { usuarioId, outroUsuarioId: outroId } },
          create: { usuarioId, outroUsuarioId: outroId, solicitacao: "nenhuma" },
          update: { solicitacao: "nenhuma" },
        }),
        prismaClient.conversaConfig.upsert({
          where: { usuarioId_outroUsuarioId: { usuarioId: outroId, outroUsuarioId: usuarioId } },
          create: { usuarioId: outroId, outroUsuarioId: usuarioId, solicitacao: "nenhuma" },
          update: { solicitacao: "nenhuma" },
        }),
      ]);
      return createSuccess({ message: "Solicitação aceita." });
    } catch (error) {
      console.error(error);
      return createError("Erro no servidor.", HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  }

  async recusarSolicitacao(usuarioId: number, outroId: number): Promise<ServiceResponse> {
    try {
      // Para quem recusou: deletar o registro (conversa some)
      await prismaClient.conversaConfig.deleteMany({
        where: { usuarioId, outroUsuarioId: outroId },
      });
      // Para quem enviou: manter registro com "enviada" (fica pendente)
      // Não apaga mensagens — ficam visíveis para o remetente
      return createSuccess({ message: "Solicitação recusada." });
    } catch (error) {
      console.error(error);
      return createError("Erro no servidor.", HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  }

  async arquivar(usuarioId: number, outroId: number): Promise<ServiceResponse> {
    try {
      await prismaClient.conversaConfig.upsert({
        where: { usuarioId_outroUsuarioId: { usuarioId, outroUsuarioId: outroId } },
        create: { usuarioId, outroUsuarioId: outroId, arquivada: true },
        update: { arquivada: true },
      });
      return createSuccess({ message: "Conversa arquivada." });
    } catch (error) {
      console.error(error);
      return createError("Erro no servidor.", HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  }

  async desarquivar(usuarioId: number, outroId: number): Promise<ServiceResponse> {
    try {
      await prismaClient.conversaConfig.upsert({
        where: { usuarioId_outroUsuarioId: { usuarioId, outroUsuarioId: outroId } },
        create: { usuarioId, outroUsuarioId: outroId, arquivada: false },
        update: { arquivada: false },
      });
      return createSuccess({ message: "Conversa desarquivada." });
    } catch (error) {
      console.error(error);
      return createError("Erro no servidor.", HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  }

  async deletar(usuarioId: number, outroId: number): Promise<ServiceResponse> {
    try {
      await prismaClient.conversaConfig.upsert({
        where: { usuarioId_outroUsuarioId: { usuarioId, outroUsuarioId: outroId } },
        create: { usuarioId, outroUsuarioId: outroId, deletadaEm: new Date() },
        update: { deletadaEm: new Date() },
      });
      return createSuccess({ message: "Conversa deletada." });
    } catch (error) {
      console.error(error);
      return createError("Erro no servidor.", HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  }
}
