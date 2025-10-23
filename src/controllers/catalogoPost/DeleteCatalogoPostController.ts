import { Request, Response } from "express";
import { DeleteCatalogoPostService } from "../../services/catalogoPost/DeleteCatalogoPostService";

export class DeleteCatalogoPostController {
  async handle(req: Request, res: Response) {
    try {
      const { catalogoId, postId } = req.params;

      if (!catalogoId || !postId) {
        return res
          .status(400)
          .json({ message: "ID do catálogo e do post são obrigatórios" });
      }

      const service = new DeleteCatalogoPostService();
      const resultado = await service.execute(
        Number(catalogoId),
        Number(postId)
      );

      return res.json(resultado);
    } catch (error: any) {
      console.error("Erro ao deletar post do catálogo:", error.message);
      return res.status(500).json({ message: error.message });
    }
  }
}
