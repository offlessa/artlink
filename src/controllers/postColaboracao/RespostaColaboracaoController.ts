import { Response } from "express";
import { AuthRequest } from "../../middleware/authMiddleware";
import { RespostaColaboracaoService } from "../../services/postColaboracao/RespostaColaboracaoService";

const service = new RespostaColaboracaoService();

export class RespostaColaboracaoController {
  async aceitar(req: AuthRequest, res: Response) {
    const postId = Number(req.params["postId"]);
    const usuarioId = req.usuarioId!;

    const result = await service.aceitar(postId, usuarioId);
    return res.status(result.statusCode).json(result.data);
  }

  async recusar(req: AuthRequest, res: Response) {
    const postId = Number(req.params["postId"]);
    const usuarioId = req.usuarioId!;

    const result = await service.recusar(postId, usuarioId);
    return res.status(result.statusCode).json(result.data);
  }
}
