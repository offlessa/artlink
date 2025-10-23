import { Request, Response } from "express";
import { GetComentarioService } from "../../services/comentario/GetComentarioService";

export class GetComentarioController {
  async getByPost(req: Request, res: Response) {
    try {
      const { postId } = req.params;
      const service = new GetComentarioService();
      const comentarios = await service.getByPost(Number(postId));

      if (!comentarios || comentarios.length === 0) {
        return res
          .status(404)
          .json({ message: "Nenhum comentário encontrado" });
      }

      return res.json(comentarios);
    } catch (error) {
      console.error("Erro ao buscar comentários do post:", error);
      return res.status(500).json({ message: "Erro interno do servidor" });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const service = new GetComentarioService();
      const comentario = await service.getById(Number(id));

      if (!comentario) {
        return res.status(404).json({ message: "Comentário não encontrado" });
      }

      return res.json(comentario);
    } catch (error) {
      console.error("Erro ao buscar comentário:", error);
      return res.status(500).json({ message: "Erro interno do servidor" });
    }
  }
}
