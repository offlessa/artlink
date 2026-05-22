import { Request, Response } from "express";
import { EsqueciSenhaService } from "../../services/auth/EsqueciSenhaService";
import { sendResponse } from "../../../utils/createError";

export class EsqueciSenhaController {
  async handle(req: Request, res: Response) {
    const { email } = req.body;
    const service = new EsqueciSenhaService();
    const result = await service.execute(email);
    return sendResponse(res, result);
  }
}
