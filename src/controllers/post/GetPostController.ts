import { Request, Response } from "express";
import { GetPostService } from "../../services/post/GetPostService";

export class GetPostController {
  getAll = async (req: Request, res: Response) => {
    const service = new GetPostService();
    const posts = await service.getAll();
    return res.json(posts);
  };

  getById = async (req: Request, res: Response) => {
    const { postId } = req.params;
    const service = new GetPostService();
    const post = await service.getById(Number(postId));
    if (!post) return res.status(404).json({ message: "Post não encontrado" });
    return res.json(post);
  };

  getByUsuario = async (req: Request, res: Response) => {
    const { usuarioId } = req.params;
    const service = new GetPostService();

    try {
      const posts = await service.getByUsuario(Number(usuarioId));
      return res.json(posts);
    } catch (error: any) {
      console.error("Erro ao buscar posts do usuário:", error.message);
      return res.status(500).json({ message: error.message });
    }
  };
}
