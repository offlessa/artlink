import { Request, Response } from "express";
import { CreateComentarioService } from "../../services/comentario/CreateComentarioService";
import { sendResponse } from "../../../utils/createError";

export class CreateComentarioController {
  async handle(req: Request, res: Response) {
    const { usuarioId, postId, conteudo } = req.body;

    const service = new CreateComentarioService();
    const result = await service.execute({ usuarioId, postId, conteudo });

    return sendResponse(res, result);
  }
}
