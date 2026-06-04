import { Request, Response } from "express";
import { CreateMensagemService } from "../../services/mensagem/CreateMensagemService";
import { sendResponse } from "../../../utils/createError";

export class CreateMensagemController {
  async handle(req: Request, res: Response) {
    const { remetenteId, destinatarioId, conteudo, imagem } = req.body;

    const service = new CreateMensagemService();
    const result = await service.execute({
      remetenteId,
      destinatarioId,
      conteudo,
      imagem,
    });

    return sendResponse(res, result);
  }
}
