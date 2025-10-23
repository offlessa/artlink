import { Request, Response } from "express";
import { DeleteCurtidaService } from "../../services/curtida/DeleteCurtidaService";

export class DeleteCurtidaController {
  async handle(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ message: "ID da curtida é obrigatório" });
      }

      const service = new DeleteCurtidaService();
      const resultado = await service.execute(Number(id));

      return res.json(resultado);
    } catch (error: any) {
      console.error("Erro ao deletar curtida:", error.message);
      return res.status(500).json({ message: error.message });
    }
  }
}
