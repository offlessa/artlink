import { Request, Response } from "express";
import { UpdateNotificacaoService } from "../../services/notificacao/UpdateNotificacaoService";
import { sendResponse } from "../../../utils/createError";

export class UpdateNotificacaoController {
  async marcarTodasLidas(req: Request, res: Response) {
    const { usuarioId } = req.params;
    const service = new UpdateNotificacaoService();
    const result = await service.marcarTodasLidas(Number(usuarioId));
    return sendResponse(res, result);
  }
}
