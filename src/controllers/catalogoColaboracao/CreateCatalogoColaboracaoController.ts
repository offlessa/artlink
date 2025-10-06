import { Request, Response } from "express";
import { CreateCatalogoColaboracaoService } from "../../services/catalogoColaboracao/CreateCatalogoColaboracaoService";
import { sendResponse } from "../../../utils/createError";

export class CreateCatalogoColaboracaoController {
  async handle(req: Request, res: Response) {
    const { catalogoId, usuarioId } = req.body;

    const createCatalogoColaboracaoService =
      new CreateCatalogoColaboracaoService();

    const colaboracao = await createCatalogoColaboracaoService.execute({
      catalogoId,
      usuarioId,
    });

    return sendResponse(res, colaboracao);
  }
}
