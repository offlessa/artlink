import { Request, Response } from "express";
import { GetCurtidaService } from "../../services/curtida/GetCurtidaService";

export class GetCurtidaController {
  async getByPost(req: Request, res: Response) {
    try {
      const { postId } = req.params;
      const service = new GetCurtidaService();
      const curtidas = await service.getByPost(Number(postId));

      if (!curtidas || curtidas.length === 0) {
        return res.status(404).json({ message: "Nenhuma curtida encontrada" });
      }

      return res.json(curtidas);
    } catch (error) {
      console.error("Erro ao buscar curtidas do post:", error);
      return res.status(500).json({ message: "Erro interno do servidor" });
    }
  }

  async getByUsuario(req: Request, res: Response) {
    try {
      const { usuarioId } = req.params;
      const service = new GetCurtidaService();
      const curtidas = await service.getByUsuario(Number(usuarioId));

      if (!curtidas || curtidas.length === 0) {
        return res
          .status(404)
          .json({ message: "Nenhuma curtida encontrada para o usuário" });
      }

      return res.json(curtidas);
    } catch (error) {
      console.error("Erro ao buscar curtidas do usuário:", error);
      return res.status(500).json({ message: "Erro interno do servidor" });
    }
  }
}
