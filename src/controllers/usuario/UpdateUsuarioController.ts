import { Request, Response } from "express";
import { UpdateUsuarioService } from "../../services/usuario/UpdateUsuarioService";

export class UpdateUsuarioController {
  async handle(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const dados = req.body;

      if (!id) {
        return res.status(400).json({ message: "ID do usuário não fornecido" });
      }

      const service = new UpdateUsuarioService();
      const usuarioAtualizado = await service.execute({
        id: Number(id),
        ...dados,
      });

      return res.json(usuarioAtualizado);
    } catch (error: any) {
      console.error("Erro ao atualizar usuário:", error.message);
      return res.status(500).json({ message: error.message });
    }
  }
}
