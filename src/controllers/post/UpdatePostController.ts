import { Request, Response } from "express";
import { UpdatePostService } from "../../services/post/UpdatePostService";

export class UpdatePostController {
  async handle(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { titulo, descricao, imagem } = req.body;

      if (!id) {
        return res.status(400).json({ message: "ID do post não fornecido" });
      }

      if (!titulo && !descricao && !imagem) {
        return res
          .status(400)
          .json({
            message:
              "Informe pelo menos um campo para atualizar (titulo, descricao ou imagem)",
          });
      }

      const service = new UpdatePostService();
      const resultado = await service.execute(Number(id), {
        titulo,
        descricao,
        imagem,
      });

      return res.json(resultado);
    } catch (error: any) {
      console.error("Erro ao atualizar post:", error.message);
      return res.status(500).json({ message: error.message });
    }
  }
}
