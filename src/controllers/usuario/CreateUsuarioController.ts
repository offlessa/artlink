import { Response, Request } from "express";
import { CreateUsuarioService } from "../../services/usuario/CreateUsuarioService";
import { sendResponse } from "../../../utils/createError";

export class CreateUsuarioController {
  async handle(req: Request, res: Response) {
    const { nome, username, email, senha, bio, cidade, contato, fotoPerfil } =
      req.body;

    const createUsuarioService = new CreateUsuarioService();

    const usuario = await createUsuarioService.execute({
      nome,
      username,
      email,
      senha,
      bio,
      cidade,
      contato,
      fotoPerfil,
    });

    return sendResponse(res, usuario);
  }
}
