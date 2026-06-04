import prismaClient from "../../prisma";
import {
  HttpStatusCode, ServiceResponse, createError, createSuccess,
} from "../../../utils/createError";

const LIMITE_PADRAO_MIN = 7;

export class DeleteMensagemService {
  async apagarParaMim(mensagemId: number, usuarioId: number): Promise<ServiceResponse> {
    try {
      const mensagem = await prismaClient.mensagem.findUnique({ where: { id: mensagemId } });
      if (!mensagem) return createError("Mensagem não encontrada.", HttpStatusCode.NOT_FOUND);

      const pertence = mensagem.remetenteId === usuarioId || mensagem.destinatarioId === usuarioId;
      if (!pertence) return createError("Sem permissão.", HttpStatusCode.FORBIDDEN);

      await prismaClient.mensagemDeletada.upsert({
        where: { usuarioId_mensagemId: { usuarioId, mensagemId } },
        create: { usuarioId, mensagemId },
        update: {},
      });
      return createSuccess({ message: "Mensagem apagada para você." });
    } catch (error) {
      console.error(error);
      return createError("Erro no servidor.", HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  }

  async apagarParaTodos(mensagemId: number, usuarioId: number): Promise<ServiceResponse> {
    try {
      const mensagem = await prismaClient.mensagem.findUnique({ where: { id: mensagemId } });
      if (!mensagem) return createError("Mensagem não encontrada.", HttpStatusCode.NOT_FOUND);

      if (mensagem.remetenteId !== usuarioId) {
        return createError("Só o remetente pode apagar para todos.", HttpStatusCode.FORBIDDEN);
      }

      const cfgRaw = (await prismaClient.usuario.findUnique({
        where: { id: usuarioId }, select: { configuracoes: true },
      }))?.configuracoes;
      const cfg = cfgRaw ? JSON.parse(cfgRaw) : null;
      const limiteMin = cfg?.mensagens?.limitePararaTodos ?? LIMITE_PADRAO_MIN;
      const limiteMs = limiteMin * 60 * 1000;

      const agora = Date.now();
      const envio = new Date(mensagem.dataEnvio).getTime();
      if (agora - envio > limiteMs) {
        return createError(`O prazo de ${limiteMin} minuto(s) para apagar para todos expirou.`, HttpStatusCode.FORBIDDEN);
      }

      await prismaClient.mensagem.update({
        where: { id: mensagemId },
        data: { apagadaParaTodos: true, conteudo: "", imagem: null },
      });
      return createSuccess({ message: "Mensagem apagada para todos." });
    } catch (error) {
      console.error(error);
      return createError("Erro no servidor.", HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  }

  // Mantido para compatibilidade com rota antiga
  async execute(id: number) {
    const mensagem = await prismaClient.mensagem.findUnique({ where: { id } });
    if (!mensagem) throw new Error("Mensagem não encontrada");
    await prismaClient.mensagem.delete({ where: { id } });
    return { message: "Mensagem deletada com sucesso" };
  }
}
