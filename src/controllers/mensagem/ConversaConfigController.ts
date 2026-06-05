import { Response } from "express";
import { AuthRequest } from "../../middleware/authMiddleware";
import { ConversaConfigService } from "../../services/mensagem/ConversaConfigService";
import { sendResponse } from "../../../utils/createError";

const service = new ConversaConfigService();

export class ConversaConfigController {
  async aceitar(req: AuthRequest, res: Response) {
    const usuarioId = req.usuarioId!;
    const outroId = Number(req.params["outroId"]);
    const result = await service.aceitarSolicitacao(usuarioId, outroId);
    return sendResponse(res, result);
  }

  async recusar(req: AuthRequest, res: Response) {
    const usuarioId = req.usuarioId!;
    const outroId = Number(req.params["outroId"]);
    const result = await service.recusarSolicitacao(usuarioId, outroId);
    return sendResponse(res, result);
  }

  async arquivar(req: AuthRequest, res: Response) {
    const usuarioId = req.usuarioId!;
    const outroId = Number(req.params["outroId"]);
    const result = await service.arquivar(usuarioId, outroId);
    return sendResponse(res, result);
  }

  async desarquivar(req: AuthRequest, res: Response) {
    const usuarioId = req.usuarioId!;
    const outroId = Number(req.params["outroId"]);
    const result = await service.desarquivar(usuarioId, outroId);
    return sendResponse(res, result);
  }

  async deletar(req: AuthRequest, res: Response) {
    const usuarioId = req.usuarioId!;
    const outroId = Number(req.params["outroId"]);
    const result = await service.deletar(usuarioId, outroId);
    return sendResponse(res, result);
  }
}
