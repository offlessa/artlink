import { Request, Response } from "express";
import { UpdateComentarioService } from "../../services/comentario/UpdateComentarioService";

export class UpdateComentarioController {
  async handle(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { conteudo } = req.body;

      if (!id) {
        return res
          .status(400)
          .json({ message: "ID do comentário não fornecido" });
      }

      if (!conteudo || typeof conteudo !== "string") {
        return res.status(400).json({ message: "Conteúdo inválido" });
      }

      const service = new UpdateComentarioService();
      const resultado = await service.execute({ id: Number(id), conteudo });

      return res.json(resultado);
    } catch (error: any) {
      console.error("Erro ao atualizar comentário:", error.message);
      return res.status(500).json({ message: error.message });
    }
  }
}
