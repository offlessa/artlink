import { Request, Response } from "express";
import { DeletePostService } from "../../services/post/DeletePostService";

export class DeletePostController {
  async handle(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ message: "ID do post é obrigatório" });
      }

      const service = new DeletePostService();
      const result = await service.execute(Number(id));

      return res.json(result);
    } catch (error: any) {
      console.error("Erro ao deletar post:", error.message);
      return res.status(500).json({ message: error.message });
    }
  }
}
