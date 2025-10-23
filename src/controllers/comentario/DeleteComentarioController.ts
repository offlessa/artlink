import { Request, Response } from "express";
import { DeleteComentarioService } from "../../services/comentario/DeleteComentarioService";

export class DeleteComentarioController {
  async handle(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id) {
        return res
          .status(400)
          .json({ message: "ID do comentário é obrigatório" });
      }

      const service = new DeleteComentarioService();
      const resultado = await service.execute(Number(id));

      return res.json(resultado);
    } catch (error: any) {
      console.error("Erro ao deletar comentário:", error.message);
      return res.status(500).json({ message: error.message });
    }
  }
}
