import { Request, Response } from "express";
import { GetPostService } from "../../services/post/GetPostService";

export class GetPostController {
  // Busca todos os posts
  async getAll(req: Request, res: Response) {
    try {
      const service = new GetPostService();
      const posts = await service.getAll();

      if (!posts || posts.length === 0) {
        return res.status(404).json({ message: "Nenhum post encontrado" });
      }

      return res.json(posts);
    } catch (error) {
      console.error("Erro ao buscar posts:", error);
      return res.status(500).json({ message: "Erro interno do servidor" });
    }
  }

  // Busca um post pelo ID
  async getById(req: Request, res: Response) {
    try {
      const { postId } = req.params;
      const service = new GetPostService();

      const post = await service.getById(Number(postId));

      if (!post) {
        return res.status(404).json({ message: "Post não encontrado" });
      }

      return res.json(post);
    } catch (error) {
      console.error("Erro ao buscar post:", error);
      return res.status(500).json({ message: "Erro interno do servidor" });
    }
  }
}
