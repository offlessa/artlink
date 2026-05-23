import { Request, Response } from "express";
import { CreateCatalogoImagemService } from "../../services/catalogoImagem/CreateCatalogoImagemService";

export class CreateCatalogoImagemController {
  async handle(req: Request, res: Response) {
    try {
      const { catalogoId, imagem } = req.body;
      if (!catalogoId || !imagem) {
        return res.status(400).json({ message: "catalogoId e imagem são obrigatórios" });
      }
      const service = new CreateCatalogoImagemService();
      const result = await service.execute({ catalogoId: Number(catalogoId), imagem });
      return res.status(201).json(result);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }
}
