import { Request, Response } from "express";
import { GetMensagemService } from "../../services/mensagem/GetMensagemService";

export class GetMensagemController {
  private service = new GetMensagemService();

  // Mensagens recebidas
  async getByDestinatario(req: Request, res: Response) {
    try {
      const { destinatarioId } = req.params;
      const mensagens = await this.service.getByDestinatario(Number(destinatarioId));
      return res.json(mensagens);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  async contarNaoLidas(req: Request, res: Response) {
    try {
      const { destinatarioId } = req.params;
      const count = await this.service.contarNaoLidas(Number(destinatarioId));
      return res.json({ count });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  async getConfigs(req: Request, res: Response) {
    try {
      const { usuarioId } = req.params;
      const configs = await this.service.getConfigs(Number(usuarioId));
      return res.json(configs);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  // Mensagens enviadas
  async getByRemetente(req: Request, res: Response) {
    try {
      const { remetenteId } = req.params;
      const mensagens = await this.service.getByRemetente(Number(remetenteId));
      return res.json(mensagens);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }
}
