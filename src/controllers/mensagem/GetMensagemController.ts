import { Request, Response } from "express";
import { GetMensagemService } from "../../services/mensagem/GetMensagemService";

export class GetMensagemController {
  private service = new GetMensagemService();

  // Mensagens recebidas
  async getByDestinatario(req: Request, res: Response) {
    try {
      const { destinatarioId } = req.params;
      const mensagens = await this.service.getByDestinatario(
        Number(destinatarioId)
      );

      if (!mensagens || mensagens.length === 0) {
        return res.status(404).json({ message: "Nenhuma mensagem encontrada" });
      }

      return res.json(mensagens);
    } catch (error: any) {
      console.error("Erro ao buscar mensagens do destinatário:", error);
      return res.status(500).json({ message: error.message });
    }
  }

  // Mensagens enviadas
  async getByRemetente(req: Request, res: Response) {
    try {
      const { remetenteId } = req.params;
      const mensagens = await this.service.getByRemetente(Number(remetenteId));

      if (!mensagens || mensagens.length === 0) {
        return res.status(404).json({ message: "Nenhuma mensagem encontrada" });
      }

      return res.json(mensagens);
    } catch (error: any) {
      console.error("Erro ao buscar mensagens do remetente:", error);
      return res.status(500).json({ message: error.message });
    }
  }
}
