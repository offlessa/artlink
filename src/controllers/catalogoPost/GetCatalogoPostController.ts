import { Request, Response } from "express";
import { GetCatalogoPostService } from "../../services/catalogoPost/GetCatalogoPostService";

export class GetCatalogoPostController {
  async getByCatalogo(req: Request, res: Response) {
    try {
      const { catalogoId } = req.params;
      const service = new GetCatalogoPostService();

      const result = await service.getByCatalogo(Number(catalogoId));

      if (!result || result.length === 0) {
        return res
          .status(404)
          .json({ message: "Nenhum post encontrado para este catálogo" });
      }

      return res.json(result);
    } catch (error) {
      console.error("Erro ao buscar posts do catálogo:", error);
      return res.status(500).json({ message: "Erro interno do servidor" });
    }
  }
}
