import { Request, Response } from "express";
import { VerificarEmailService } from "../../services/auth/VerificarEmailService";
import { sendResponse } from "../../../utils/createError";

export class VerificarEmailController {
  handle = async (req: Request, res: Response) => {
    const { token } = req.body;
    const service = new VerificarEmailService();
    const result = await service.execute(token);
    return sendResponse(res, result);
  };
}
