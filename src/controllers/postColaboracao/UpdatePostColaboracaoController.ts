import { Request, Response } from "express";
import { UpdatePostColaboracaoService } from "../../services/postColaboracao/UpdatePostColaboracaoService";

export class UpdatePostColaboracaoController {
  async handle(req: Request, res: Response) {
    try {
      const { postId } = req.params;
      const colaboradores = req.body.colaboradores; // espera array de { usuarioId }

      if (!postId) {
        return res.status(400).json({ message: "ID do post não fornecido" });
      }

      if (!Array.isArray(colaboradores)) {
        return res
          .status(400)
          .json({
            message: "colaboradores deve ser um array de objetos { usuarioId }",
          });
      }

      const service = new UpdatePostColaboracaoService();
      const resultado = await service.execute(Number(postId), colaboradores);

      return res.json(resultado);
    } catch (error: any) {
      console.error("Erro ao atualizar colaborações do post:", error.message);
      return res.status(500).json({ message: error.message });
    }
  }
}
