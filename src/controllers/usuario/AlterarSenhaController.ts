import { Response } from "express";
import { AuthRequest } from "../../middleware/authMiddleware";
import { AlterarSenhaService } from "../../services/usuario/AlterarSenhaService";
import { sendResponse } from "../../../utils/createError";

export class AlterarSenhaController {
  async handle(req: AuthRequest, res: Response) {
    const usuarioId = req.usuarioId!;
    const { senhaAtual, novaSenha } = req.body;
    const service = new AlterarSenhaService();
    const result = await service.execute(usuarioId, senhaAtual, novaSenha);
    return sendResponse(res, result);
  }
}
