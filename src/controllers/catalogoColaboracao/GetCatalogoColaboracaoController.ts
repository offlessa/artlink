import { Request, Response } from "express";
import { GetCatalogoColaboracaoService } from "../../services/catalogoColaboracao/GetCatalogoColaboracaoService";

export class GetCatalogoColaboracaoController {
  // Retorna todas as colaborações de catálogo
  async getAll(req: Request, res: Response) {
    const service = new GetCatalogoColaboracaoService();
    const result = await service.getAll();
    return res.json(result);
  }

  // Retorna colaborações de um catálogo específico
  async getByCatalogo(req: Request, res: Response) {
    const { catalogoId } = req.params;
    const service = new GetCatalogoColaboracaoService();
    const result = await service.getByCatalogo(Number(catalogoId));

    if (!result || result.length === 0) {
      return res
        .status(404)
        .json({ message: "Nenhuma colaboração encontrada para este catálogo" });
    }

    return res.json(result);
  }

  // Retorna todos os catálogos nos quais um usuário é colaborador
  async getByUsuario(req: Request, res: Response) {
    const { usuarioId } = req.params;
    const service = new GetCatalogoColaboracaoService();
    const result = await service.getByUsuario(Number(usuarioId));

    if (!result || result.length === 0) {
      return res
        .status(404)
        .json({ message: "Nenhuma colaboração encontrada para este usuário" });
    }

    return res.json(result);
  }
}
