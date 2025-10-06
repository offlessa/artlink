import { Request, Response } from "express";
import { CreateCatalogoPostService } from "../../services/catalogoPost/CreateCatalogoPostService";
import { sendResponse } from "../../../utils/createError";

export class CreateCatalogoPostController {
  async handle(req: Request, res: Response) {
    const { catalogoId, postId } = req.body;

    const service = new CreateCatalogoPostService();
    const result = await service.execute({ catalogoId, postId });

    return sendResponse(res, result);
  }
}
