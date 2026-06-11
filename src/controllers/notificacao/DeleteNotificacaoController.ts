import { Request, Response } from "express";
import { DeleteNotificacaoService } from "../../services/notificacao/DeleteNotificacaoService";
import { sendResponse } from "../../../utils/createError";

export class DeleteNotificacaoController {
  async deletarUma(req: Request, res: Response) {
    const { id } = req.params;
    const service = new DeleteNotificacaoService();
    const result = await service.deletarUma(Number(id));
    return sendResponse(res, result);
  }

  async deletarTodas(req: Request, res: Response) {
    const { usuarioId } = req.params;
    const service = new DeleteNotificacaoService();
    const result = await service.deletarTodas(Number(usuarioId));
    return sendResponse(res, result);
  }
}
