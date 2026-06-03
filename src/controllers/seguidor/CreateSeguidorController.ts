import { Request, Response } from "express";
import { CreateSeguidorService } from "../../services/seguidor/CreateSeguidorService";
import { sendResponse } from "../../../utils/createError";

export class CreateSeguidorController {
  async handle(req: Request, res: Response) {
    const { seguidorId, seguidoId } = req.body;
    const service = new CreateSeguidorService();
    const result = await service.execute({ seguidorId: Number(seguidorId), seguidoId: Number(seguidoId) });
    return sendResponse(res, result);
  }
}
