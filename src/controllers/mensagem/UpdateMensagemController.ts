import { Request, Response } from "express";
import { UpdateMensagemService } from "../../services/mensagem/UpdateMensagemService";

export class UpdateMensagemController {
  async handle(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { conteudo, status, curtida } = req.body;

      if (!id) {
        return res
          .status(400)
          .json({ message: "ID da mensagem não fornecido" });
      }

      if (!conteudo && !status && curtida === undefined) {
        return res
          .status(400)
          .json({
            message:
              "Informe pelo menos um campo para atualizar (conteudo, status ou curtida)",
          });
      }

      const service = new UpdateMensagemService();
      const resultado = await service.execute(Number(id), { conteudo, status, curtida });

      return res.json(resultado);
    } catch (error: any) {
      console.error("Erro ao atualizar mensagem:", error.message);
      return res.status(500).json({ message: error.message });
    }
  }
}
