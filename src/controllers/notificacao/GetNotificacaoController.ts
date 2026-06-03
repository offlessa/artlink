import { Request, Response } from "express";
import { GetNotificacaoService } from "../../services/notificacao/GetNotificacaoService";
import { sendResponse } from "../../../utils/createError";

export class GetNotificacaoController {
  async getByUsuario(req: Request, res: Response) {
    const { usuarioId } = req.params;
    const service = new GetNotificacaoService();
    const result = await service.getByUsuario(Number(usuarioId));
    return sendResponse(res, result);
  }

  async contarNaoLidas(req: Request, res: Response) {
    const { usuarioId } = req.params;
    const service = new GetNotificacaoService();
    const result = await service.contarNaoLidas(Number(usuarioId));
    return sendResponse(res, result);
  }
}
