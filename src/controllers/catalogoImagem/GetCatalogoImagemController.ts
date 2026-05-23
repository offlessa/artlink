import { Request, Response } from "express";
import { GetCatalogoImagemService } from "../../services/catalogoImagem/GetCatalogoImagemService";

export class GetCatalogoImagemController {
  async handle(req: Request, res: Response) {
    try {
      const { catalogoId } = req.params;
      const service = new GetCatalogoImagemService();
      const result = await service.getByCatalogo(Number(catalogoId));
      return res.json(result);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }
}
