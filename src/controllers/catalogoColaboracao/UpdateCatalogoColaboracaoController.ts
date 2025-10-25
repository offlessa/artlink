import { Request, Response } from "express";
import { UpdateCatalogoColaboracaoService } from "../../services/catalogoColaboracao/UpdateCatalogoColaboracaoService";

export class UpdateCatalogoColaboracaoController {
  async handle(req: Request, res: Response) {
    try {
      const { catalogoId, usuarioId } = req.body;

      if (!catalogoId || !usuarioId) {
        return res.status(400).json({
          message: "Os campos catalogoId e usuarioId são obrigatórios.",
        });
      }

      const service = new UpdateCatalogoColaboracaoService();
      const result = await service.execute({
        catalogoId: Number(catalogoId),
        usuarioId: Number(usuarioId),
      });

      return res.status(200).json(result);
    } catch (error: any) {
      console.error("Erro ao atualizar colaboração de catálogo:", error);
      return res.status(500).json({ message: error.message });
    }
  }
}
