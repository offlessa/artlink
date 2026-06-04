import { Response } from "express";
import { AuthRequest } from "../../middleware/authMiddleware";
import { RespostaCatalogoColaboracaoService } from "../../services/catalogoColaboracao/RespostaCatalogoColaboracaoService";

const service = new RespostaCatalogoColaboracaoService();

export class RespostaCatalogoColaboracaoController {
  async aceitar(req: AuthRequest, res: Response) {
    const catalogoId = Number(req.params["catalogoId"]);
    const usuarioId = req.usuarioId!;
    const result = await service.aceitar(catalogoId, usuarioId);
    return res.status(result.statusCode).json(result.data);
  }

  async recusar(req: AuthRequest, res: Response) {
    const catalogoId = Number(req.params["catalogoId"]);
    const usuarioId = req.usuarioId!;
    const result = await service.recusar(catalogoId, usuarioId);
    return res.status(result.statusCode).json(result.data);
  }
}
