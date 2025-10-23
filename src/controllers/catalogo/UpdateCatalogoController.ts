import { Request, Response } from "express";
import { UpdateCatalogoService } from "../../services/catalogo/UpdateCatalogoService";

export class UpdateCatalogoController {
  async handle(req: Request, res: Response) {
    try {
      const { id } = req.params; // vem da URL
      const { nome, descricao } = req.body;

      if (!id) {
        return res
          .status(400)
          .json({ message: "ID do catálogo não fornecido" });
      }

      const service = new UpdateCatalogoService();
      const catalogoAtualizado = await service.execute({
        id: Number(id),
        nome,
        descricao,
      });

      return res.json(catalogoAtualizado);
    } catch (error: any) {
      console.error("Erro ao atualizar catálogo:", error.message);
      return res.status(500).json({ message: error.message });
    }
  }
}
