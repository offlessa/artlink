import { Response } from "express";
import { AuthRequest } from "../../middleware/authMiddleware";
import { ExportarDadosService } from "../../services/usuario/ExportarDadosService";

export class ExportarDadosController {
  async handle(req: AuthRequest, res: Response) {
    const usuarioId = req.usuarioId!;
    try {
      const service = new ExportarDadosService();
      const dados = await service.execute(usuarioId);
      res.setHeader("Content-Type", "application/json");
      res.setHeader("Content-Disposition", `attachment; filename="artlink-dados-${usuarioId}.json"`);
      return res.json(dados);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }
}
