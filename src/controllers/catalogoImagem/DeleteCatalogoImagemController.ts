import { Request, Response } from "express";
import { DeleteCatalogoImagemService } from "../../services/catalogoImagem/DeleteCatalogoImagemService";

export class DeleteCatalogoImagemController {
  async handle(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const service = new DeleteCatalogoImagemService();
      await service.execute(Number(id));
      return res.json({ message: "Imagem removida" });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }
}
