import { Request, Response } from "express";
import { ReenviarVerificacaoService } from "../../services/auth/ReenviarVerificacaoService";
import { sendResponse } from "../../../utils/createError";

export class ReenviarVerificacaoController {
  handle = async (req: Request, res: Response) => {
    const { email } = req.body;
    const service = new ReenviarVerificacaoService();
    const result = await service.execute(email);
    return sendResponse(res, result);
  };
}
