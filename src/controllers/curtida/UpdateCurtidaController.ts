import { Request, Response } from "express";
import { UpdateCurtidaService } from "../../services/curtida/UpdateCurtidaService";

export class UpdateCurtidaController {
  async handle(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { postId } = req.body;

      if (!id) {
        return res.status(400).json({ message: "ID da curtida não fornecido" });
      }

      if (!postId || typeof postId !== "number") {
        return res.status(400).json({ message: "postId inválido" });
      }

      const service = new UpdateCurtidaService();
      const resultado = await service.execute(Number(id), postId);

      return res.json(resultado);
    } catch (error: any) {
      console.error("Erro ao atualizar curtida:", error.message);
      return res.status(500).json({ message: error.message });
    }
  }
}
