import { Request, Response } from "express";
import { CreateCurtidaService } from "../../services/curtida/CreateCurtidaService";
import { sendResponse } from "../../../utils/createError";

export class CreateCurtidaController {
  async handle(req: Request, res: Response) {
    const { usuarioId, postId } = req.body;

    const service = new CreateCurtidaService();
    const result = await service.execute({ usuarioId, postId });

    return sendResponse(res, result);
  }
}
