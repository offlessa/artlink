import { Response } from "express";
import { AuthRequest } from "../../middleware/authMiddleware";
import { DeleteMensagemService } from "../../services/mensagem/DeleteMensagemService";

const service = new DeleteMensagemService();

export class DeleteMensagemController {
  async apagarParaMim(req: AuthRequest, res: Response) {
    const mensagemId = Number(req.params["id"]);
    const usuarioId = req.usuarioId!;
    const result = await service.apagarParaMim(mensagemId, usuarioId);
    return res.status(result.statusCode).json(result.data);
  }

  async apagarParaTodos(req: AuthRequest, res: Response) {
    const mensagemId = Number(req.params["id"]);
    const usuarioId = req.usuarioId!;
    const result = await service.apagarParaTodos(mensagemId, usuarioId);
    return res.status(result.statusCode).json(result.data);
  }

  // rota legada
  async handle(req: AuthRequest, res: Response) {
    try {
      const result = await service.execute(Number(req.params["id"]));
      return res.json(result);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }
}
