import { Request, Response } from "express";
import { UpdatePostService } from "../../services/post/UpdatePostService";

export class UpdatePostController {
  async handle(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { titulo, descricao, imagem, tags, thumbnails } = req.body;

      if (!id) {
        return res.status(400).json({ message: "ID do post não fornecido" });
      }

      const service = new UpdatePostService();
      const resultado = await service.execute(Number(id), {
        titulo,
        descricao,
        imagem,
        tags: Array.isArray(tags) ? tags : undefined,
        thumbnails: Array.isArray(thumbnails) ? thumbnails : undefined,
      });

      return res.json(resultado);
    } catch (error: any) {
      console.error("Erro ao atualizar post:", error.message);
      return res.status(500).json({ message: error.message });
    }
  }
}
