import { Request, Response } from "express";
import { UpdateCatalogoPostService } from "../../services/catalogoPost/UpdateCatalogoPostService";

export class UpdateCatalogoPostController {
  async handle(req: Request, res: Response) {
    try {
      const { catalogoId } = req.params;
      const posts = req.body.posts; // espera array de { postId: number }

      if (!catalogoId) {
        return res
          .status(400)
          .json({ message: "ID do catálogo não fornecido" });
      }

      if (!Array.isArray(posts)) {
        return res
          .status(400)
          .json({ message: "posts deve ser um array de objetos { postId }" });
      }

      const service = new UpdateCatalogoPostService();
      const result = await service.execute(Number(catalogoId), posts);

      return res.json(result);
    } catch (error: any) {
      console.error("Erro ao atualizar posts do catálogo:", error.message);
      return res.status(500).json({ message: error.message });
    }
  }
}
