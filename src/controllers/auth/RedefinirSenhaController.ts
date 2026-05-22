import { Request, Response } from "express";
import { RedefinirSenhaService } from "../../services/auth/RedefinirSenhaService";
import { sendResponse } from "../../../utils/createError";

export class RedefinirSenhaController {
  async handle(req: Request, res: Response) {
    const { email, codigo, novaSenha } = req.body;
    const service = new RedefinirSenhaService();
    const result = await service.execute(email, codigo, novaSenha);
    return sendResponse(res, result);
  }
}
