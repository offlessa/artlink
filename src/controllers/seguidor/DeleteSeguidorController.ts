import { Request, Response } from "express";
import { DeleteSeguidorService } from "../../services/seguidor/DeleteSeguidorService";
import { sendResponse } from "../../../utils/createError";

export class DeleteSeguidorController {
  async handle(req: Request, res: Response) {
    const { seguidorId, seguidoId } = req.params;
    const service = new DeleteSeguidorService();
    const result = await service.execute({ seguidorId: Number(seguidorId), seguidoId: Number(seguidoId) });
    return sendResponse(res, result);
  }
}
