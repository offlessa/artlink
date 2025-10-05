import { Request, Response } from "express";
import { CreatePostColaboracaoService } from "../../services/postColaboracao/CreatePostColaboracaoService";
import { sendResponse } from "../../../utils/createError";

export class CreatePostColaboracaoController {
  async handle(req: Request, res: Response) {
    const { postId, usuarioId } = req.body;

    const createPostColaboracaoService = new CreatePostColaboracaoService();

    const colaboracao = await createPostColaboracaoService.execute({
      postId,
      usuarioId,
    });

    return sendResponse(res, colaboracao);
  }
}
