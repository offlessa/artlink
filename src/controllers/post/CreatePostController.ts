import { Response, Request } from "express";
import { CreatePostService } from "../../services/post/CreatePostService";
import { sendResponse } from "../../../utils/createError";

export class CreatePostController {
  async handle(req: Request, res: Response) {
    const { usuarioId, titulo, descricao, imagem, imagens, tags } = req.body;

    const createPostService = new CreatePostService();

    const post = await createPostService.execute({
      usuarioId,
      titulo,
      descricao,
      imagem,
      imagens: Array.isArray(imagens) ? imagens : [],
      tags: Array.isArray(tags) ? tags : [],
    });

    return sendResponse(res, post);
  }
}
