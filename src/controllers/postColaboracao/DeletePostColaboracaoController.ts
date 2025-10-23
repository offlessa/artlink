import { Request, Response } from "express";
import { DeletePostColaboracaoService } from "../../services/postColaboracao/DeletePostColaboracaoService";

export class DeletePostColaboracaoController {
  async handle(req: Request, res: Response) {
    try {
      const { postId, usuarioId } = req.params;

      if (!postId || !usuarioId) {
        return res
          .status(400)
          .json({
            success: false,
            message: "postId e usuarioId são obrigatórios",
          });
      }

      const service = new DeletePostColaboracaoService();
      const result = await service.execute(Number(postId), Number(usuarioId));

      if (!result.success) {
        return res.status(500).json(result); // aqui definimos o status HTTP manualmente
      }

      return res.status(200).json(result); // sucesso
    } catch (error: any) {
      console.error("Erro ao deletar colaboração de post:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}
