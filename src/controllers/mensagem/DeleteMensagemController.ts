import { Request, Response } from "express";
import { DeleteMensagemService } from "../../services/mensagem/DeleteMensagemService";

export class DeleteMensagemController {
  async handle(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id) {
        return res
          .status(400)
          .json({ message: "ID da mensagem é obrigatório" });
      }

      const service = new DeleteMensagemService();
      const result = await service.execute(Number(id));

      return res.json(result);
    } catch (error: any) {
      console.error("Erro ao deletar mensagem:", error.message);
      return res.status(500).json({ message: error.message });
    }
  }
}
