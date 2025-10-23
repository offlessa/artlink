import { Request, Response } from "express";
import { GetPostColaboracaoService } from "../../services/postColaboracao/GetPostColaboracaoService";

export class GetPostColaboracaoController {
  async getByUsuario(req: Request, res: Response) {
    try {
      const { usuarioId } = req.params;
      const service = new GetPostColaboracaoService();
      const result = await service.getByUsuario(Number(usuarioId));

      if (!result || result.length === 0) {
        return res
          .status(404)
          .json({
            message: "Nenhum post de colaboração encontrado para este usuário",
          });
      }

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

      if (!result || result.length === 0) {
        return res
          .status(404)
          .json({ message: "Nenhum colaborador encontrado para este post" });
      }

      return res.json(result);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Erro interno do servidor" });
    }
  }
}
