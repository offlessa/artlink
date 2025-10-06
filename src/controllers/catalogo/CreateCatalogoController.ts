import { Request, Response } from "express";
import { CreateCatalogoService } from "../../services/catalogo/CreateCatalogoService";

export class CreateCatalogoController {
  async handle(req: Request, res: Response) {
    const { usuarioId, nome, descricao } = req.body;

    try {
      const service = new CreateCatalogoService();
      const catalogo = await service.execute({ usuarioId, nome, descricao });
      return res.status(201).json(catalogo);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
}
