import { Request, Response } from "express";
import { GetSeguidorService } from "../../services/seguidor/GetSeguidorService";
import { sendResponse } from "../../../utils/createError";

export class GetSeguidorController {
  async getSeguidores(req: Request, res: Response) {
    const { usuarioId } = req.params;
    const service = new GetSeguidorService();
    const result = await service.getSeguidores(Number(usuarioId));
    return sendResponse(res, result);
  }

  async getSeguindo(req: Request, res: Response) {
    const { usuarioId } = req.params;
    const service = new GetSeguidorService();
    const result = await service.getSeguindo(Number(usuarioId));
    return sendResponse(res, result);
  }

  async getContadores(req: Request, res: Response) {
    const { usuarioId } = req.params;
    const service = new GetSeguidorService();
    const result = await service.getContadores(Number(usuarioId));
    return sendResponse(res, result);
  }

  async checarSeguindo(req: Request, res: Response) {
    const { seguidorId, seguidoId } = req.params;
    const service = new GetSeguidorService();
    const result = await service.checarSeguindo(Number(seguidorId), Number(seguidoId));
    return sendResponse(res, result);
  }
}
