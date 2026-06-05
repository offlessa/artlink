import { Request, Response } from "express";
import prismaClient from "../../prisma";

export class VisualizarPostController {
  async handle(req: Request, res: Response) {
    const id = Number(req.params["id"]);
    if (!id) return res.status(400).json({ message: "ID inválido" });
    try {
      await prismaClient.post.update({
        where: { id },
        data: { visualizacoes: { increment: 1 } },
      });
      return res.json({ ok: true });
    } catch {
      return res.json({ ok: false });
    }
  }
}
