import { Request, Response } from "express";
import { LoginService } from "../../services/auth/LoginService";
import { sendResponse } from "../../../utils/createError";

export class LoginController {
  async handle(req: Request, res: Response) {
    const { email, senha } = req.body;
    const service = new LoginService();
    const result = await service.execute(email, senha);
    return sendResponse(res, result);
  }
}
