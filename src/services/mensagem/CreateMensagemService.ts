import prismaClient from "../../prisma";
import {
  HttpStatusCode,
  ServiceResponse,
  createError,
  createSuccess,
} from "../../../utils/createError";
import { criarNotificacao } from "../../../utils/criarNotificacao";

export class CreateMensagemService {
  async execute({
    remetenteId,
    destinatarioId,
    conteudo,
    imagem,
  }: {
    remetenteId: number;
    destinatarioId: number;
    conteudo?: string;
    imagem?: string;
  }): Promise<ServiceResponse> {
    if (!remetenteId || !destinatarioId) {
      return createError("remetenteId e destinatarioId são obrigatórios.", HttpStatusCode.BAD_REQUEST);
    }
    if (!conteudo?.trim() && !imagem) {
      return createError("Envie texto ou imagem.", HttpStatusCode.BAD_REQUEST);
    }

    try {
      const [remetente, destinatario] = await Promise.all([
        prismaClient.usuario.findUnique({ where: { id: remetenteId } }),
        prismaClient.usuario.findUnique({ where: { id: destinatarioId } }),
      ]);
      if (!remetente) return createError("Remetente não encontrado.", HttpStatusCode.NOT_FOUND);
      if (!destinatario) return createError("Destinatário não encontrado.", HttpStatusCode.NOT_FOUND);

      // Verificar se já existe conversa entre eles
      const jaExisteMensagem = await prismaClient.mensagem.findFirst({
        where: {
          OR: [
            { remetenteId, destinatarioId },
            { remetenteId: destinatarioId, destinatarioId: remetenteId },
          ],
        },
      });

      const mensagem = await prismaClient.mensagem.create({
        data: {
          remetenteId,
          destinatarioId,
          conteudo: conteudo?.trim() ?? "",
          imagem: imagem ?? null,
          status: "nao_lido",
        },
      });

      // Criar notificação de mensagem (se não for conversa de solicitação pendente)
      const configDestinatario = await prismaClient.conversaConfig.findUnique({
        where: { usuarioId_outroUsuarioId: { usuarioId: destinatarioId, outroUsuarioId: remetenteId } },
      });
      if (configDestinatario?.solicitacao !== "recebida") {
        // Uma notificação por conversa (não spam a cada mensagem)
        const notifExistente = await prismaClient.notificacao.findFirst({
          where: { usuarioId: destinatarioId, remetenteId, tipo: "mensagem", lida: false },
        });
        if (!notifExistente) {
          await criarNotificacao({ usuarioId: destinatarioId, remetenteId, tipo: "mensagem" });
        }
      }

      // Verificar config de privacidade do destinatário (quem pode mandar mensagem)
      const cfgDestinatarioRaw = (await prismaClient.usuario.findUnique({
        where: { id: destinatarioId }, select: { configuracoes: true },
      }))?.configuracoes;
      const cfgDest = cfgDestinatarioRaw ? JSON.parse(cfgDestinatarioRaw) : null;
      const quemPodeMensagem = cfgDest?.privacidade?.quemPodeMensagem ?? "todos";

      if (quemPodeMensagem === "ninguem") {
        return createError("Este usuário não aceita mensagens.", HttpStatusCode.FORBIDDEN);
      }
      if (quemPodeMensagem === "seguidos") {
        const destSegueRem = await prismaClient.seguidor.findUnique({
          where: { seguidorId_seguidoId: { seguidorId: destinatarioId, seguidoId: remetenteId } },
        });
        if (!destSegueRem) return createError("Este usuário só aceita mensagens de quem segue.", HttpStatusCode.FORBIDDEN);
      }

      // Lógica de solicitação: primeira mensagem e destinatário não segue o remetente
      if (!jaExisteMensagem) {
        const destinatarioSegueRemetente = await prismaClient.seguidor.findUnique({
          where: { seguidorId_seguidoId: { seguidorId: destinatarioId, seguidoId: remetenteId } },
        });

        if (!destinatarioSegueRemetente) {
          // Criar config de solicitação para os dois lados
          await prismaClient.conversaConfig.upsert({
            where: { usuarioId_outroUsuarioId: { usuarioId: destinatarioId, outroUsuarioId: remetenteId } },
            create: { usuarioId: destinatarioId, outroUsuarioId: remetenteId, solicitacao: "recebida" },
            update: { solicitacao: "recebida" },
          });
          await prismaClient.conversaConfig.upsert({
            where: { usuarioId_outroUsuarioId: { usuarioId: remetenteId, outroUsuarioId: destinatarioId } },
            create: { usuarioId: remetenteId, outroUsuarioId: destinatarioId, solicitacao: "enviada" },
            update: { solicitacao: "enviada" },
          });
        }
      }

      return createSuccess(mensagem);
    } catch (error) {
      console.error("Erro ao criar mensagem:", error);
      return createError("Erro no servidor.", HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  }
}
