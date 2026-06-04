import { Request, Response } from "express";
import { PostSalvoService } from "../../services/postSalvo/PostSalvoService";

export class PostSalvoController {
  async salvar(req: Request, res: Response) {
    try {
      const { usuarioId, postId } = req.body;
      const result = await new PostSalvoService().salvar(Number(usuarioId), Number(postId));
      return res.status(201).json(result);
    } catch (error: any) {
      if (error?.code === "P2002") return res.status(409).json({ message: "Post já salvo" });
      return res.status(500).json({ message: "Erro ao salvar post" });
    }
  }

  async remover(req: Request, res: Response) {
    try {
      const { usuarioId, postId } = req.params;
      await new PostSalvoService().remover(Number(usuarioId), Number(postId));
      return res.json({ message: "Removido dos salvos" });
    } catch {
      return res.status(500).json({ message: "Erro ao remover post dos salvos" });
    }
  }

  async getSalvos(req: Request, res: Response) {
    try {
      const { usuarioId } = req.params;
      const posts = await new PostSalvoService().getSalvos(Number(usuarioId));
      return res.json(posts);
    } catch {
      return res.status(500).json({ message: "Erro ao buscar posts salvos" });
    }
  }

  async checar(req: Request, res: Response) {
    try {
      const { usuarioId, postId } = req.params;
      const result = await new PostSalvoService().checar(Number(usuarioId), Number(postId));
      return res.json(result);
    } catch {
      return res.status(500).json({ message: "Erro ao checar" });
    }
  }
}
