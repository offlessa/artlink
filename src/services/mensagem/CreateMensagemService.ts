import prismaClient from "../../prisma";
import { MensagemRequest, StatusMensagem } from "../../types/Mensagem";
import {
  HttpStatusCode,
  ServiceResponse,
  createError,
  createSuccess,
} from "../../../utils/createError";

export class CreateMensagemService {
  async execute({
    remetenteId,
    destinatarioId,
    conteudo,
    status,
  }: MensagemRequest): Promise<ServiceResponse> {
    if (!remetenteId || !destinatarioId || !conteudo) {
      return createError(
        "Todos os campos obrigatórios devem ser preenchidos.",
        HttpStatusCode.BAD_REQUEST
      );
    }

    try {
      const remetente = await prismaClient.usuario.findUnique({
        where: { id: remetenteId },
      });
      if (!remetente)
        return createError(
          "Remetente não encontrado.",
          HttpStatusCode.NOT_FOUND
        );

      const destinatario = await prismaClient.usuario.findUnique({
        where: { id: destinatarioId },
      });
      if (!destinatario)
        return createError(
          "Destinatário não encontrado.",
          HttpStatusCode.NOT_FOUND
        );

      const mensagem = await prismaClient.mensagem.create({
        data: {
          remetenteId,
          destinatarioId,
          conteudo: conteudo.trim(),
          status: status || StatusMensagem.NAO_LIDO,
        },
      });

      return createSuccess(mensagem);
    } catch (error) {
      console.error("Erro ao criar mensagem:", error);
      return createError(
        "Erro no servidor.",
        HttpStatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }
}
