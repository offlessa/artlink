import { Request, Response } from "express";
import { CreateMensagemService } from "../../services/mensagem/CreateMensagemService";
import { sendResponse } from "../../../utils/createError";

export class CreateMensagemController {
  async handle(req: Request, res: Response) {
    const { remetenteId, destinatarioId, conteudo, status } = req.body;

    const service = new CreateMensagemService();
    const result = await service.execute({
      remetenteId,
      destinatarioId,
      conteudo,
      status,
    });

    return sendResponse(res, result);
  }
}
