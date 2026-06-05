import { Request, Response } from "express";
import { DeleteUsuarioService } from "../../services/usuario/DeleteUsuarioService";

export class DeleteUsuarioController {
  async handle(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id) {
        return res
          .status(400)
          .json({ success: false, message: "id é obrigatório" });
      }

      const service = new DeleteUsuarioService();
      const result = await service.execute(Number(id));

      if (!result.success) {
        return res.status(404).json(result);
      }

      return res.status(200).json(result);
    } catch (error: any) {
      console.error("Erro ao deletar usuário:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}
