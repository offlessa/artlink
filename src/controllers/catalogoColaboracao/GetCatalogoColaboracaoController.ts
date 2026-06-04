import { Request, Response } from "express";
import { GetCatalogoColaboracaoService } from "../../services/catalogoColaboracao/GetCatalogoColaboracaoService";

export class GetCatalogoColaboracaoController {
  // Retorna todas as colaborações de catálogo
  async getAll(req: Request, res: Response) {
    const service = new GetCatalogoColaboracaoService();
    const result = await service.getAll();
    return res.json(result);
  }

  async getByCatalogo(req: Request, res: Response) {
    try {
      const { catalogoId } = req.params;
      const service = new GetCatalogoColaboracaoService();
      const result = await service.getByCatalogo(Number(catalogoId));
      return res.json(result);
    } catch (error) {
      return res.status(500).json({ message: "Erro interno do servidor" });
    }
  }

  async getByUsuario(req: Request, res: Response) {
    try {
      const { usuarioId } = req.params;
      const service = new GetCatalogoColaboracaoService();
      const result = await service.getByUsuario(Number(usuarioId));
      return res.json(result);
    } catch (error) {
      return res.status(500).json({ message: "Erro interno do servidor" });
    }
  }
}
