import { Request, Response } from "express";
import { GetCatalogoService } from "../../services/catalogo/GetCatalogoService";

export class GetCatalogoController {
  async getAll(req: Request, res: Response) {
    const service = new GetCatalogoService();
    const result = await service.getAll();
    return res.json(result);
  }

  async getById(req: Request, res: Response) {
    const { id } = req.params;
    const service = new GetCatalogoService();
    const result = await service.getById(Number(id));

    if (!result) {
      return res.status(404).json({ message: "Catálogo não encontrado" });
    }

    return res.json(result);
  }

  async getByUsuario(req: Request, res: Response) {
    const { usuarioId } = req.params;
    const service = new GetCatalogoService();
    const result = await service.getByUsuario(Number(usuarioId));
    return res.json(result);
  }
}
