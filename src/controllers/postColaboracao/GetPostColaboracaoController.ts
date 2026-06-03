import { Request, Response } from "express";
import { GetPostColaboracaoService } from "../../services/postColaboracao/GetPostColaboracaoService";

export class GetPostColaboracaoController {
  async getByUsuario(req: Request, res: Response) {
    try {
      const { usuarioId } = req.params;
      const service = new GetPostColaboracaoService();
      const result = await service.getByUsuario(Number(usuarioId));
      return res.json(result);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Erro interno do servidor" });
    }
  }

  async getByPost(req: Request, res: Response) {
    try {
      const { postId } = req.params;
      const service = new GetPostColaboracaoService();
      const result = await service.getByPost(Number(postId));
      return res.json(result);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Erro interno do servidor" });
    }
  }
}
