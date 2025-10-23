import { Request, Response } from "express";
import { DeleteCatalogoColaboracaoService } from "../../services/catalogoColaboracao/DeleteCatalogoColaboracaoService";

export class DeleteCatalogoColaboracaoController {
  async handle(req: Request, res: Response) {
    try {
      const { catalogoId, usuarioId } = req.params;

      if (!catalogoId || !usuarioId) {
        return res
          .status(400)
          .json({ message: "ID do catálogo e usuário são obrigatórios" });
      }

      const service = new DeleteCatalogoColaboracaoService();
      const resultado = await service.execute(
        Number(catalogoId),
        Number(usuarioId)
      );

      return res.json(resultado);
    } catch (error: any) {
      console.error("Erro ao deletar colaboração do catálogo:", error.message);
      return res.status(500).json({ message: error.message });
    }
  }
}
