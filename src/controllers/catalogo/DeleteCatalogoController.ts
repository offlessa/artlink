import { Request, Response } from "express";
import { DeleteCatalogoService } from "../../services/catalogo/DeleteCatalogoService";

export class DeleteCatalogoController {
  async handle(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id) {
        return res
          .status(400)
          .json({ message: "ID do catálogo não fornecido" });
      }

      const service = new DeleteCatalogoService();
      const resultado = await service.execute(Number(id));

      return res.json(resultado);
    } catch (error: any) {
      console.error("Erro ao deletar catálogo:", error.message);
      return res.status(500).json({ message: error.message });
    }
  }
}
