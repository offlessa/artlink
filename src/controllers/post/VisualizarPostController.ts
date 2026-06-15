import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import prismaClient from "../../prisma";

export class VisualizarPostController {
  async handle(req: Request, res: Response) {
    const id = Number(req.params["id"]);
    if (!id) return res.status(400).json({ message: "ID inválido" });

    // Tenta extrair usuário do token (rota pública — token é opcional)
    let userId: number | null = null;
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
      try {
        const secret = process.env.JWT_SECRET ?? "";
        const decoded = jwt.verify(authHeader.slice(7), secret) as { id: number };
        userId = decoded.id;
      } catch { /* token inválido ou ausente — trata como anônimo */ }
    }

    try {
      if (userId) {
        // Usuário logado: não conta visualização do próprio dono
        const post = await prismaClient.post.findUnique({
          where: { id },
          select: { usuarioId: true },
        });
        if (!post) return res.status(404).json({ message: "Post não encontrado" });
        if (post.usuarioId === userId) return res.json({ ok: true });

        // Cria registro + incrementa em transação;
        // se já visualizou (violação de unique), a transação falha silenciosamente
        await prismaClient.$transaction([
          prismaClient.visualizacao.create({ data: { usuarioId: userId, postId: id } }),
          prismaClient.post.update({ where: { id }, data: { visualizacoes: { increment: 1 } } }),
        ]);
      } else {
        // Anônimo: frontend garantiu dedup via localStorage — só incrementa
        await prismaClient.post.update({
          where: { id },
          data: { visualizacoes: { increment: 1 } },
        });
      }

      return res.json({ ok: true });
    } catch {
      // Violação de unique (já visualizou) ou erro inesperado — ignora
      return res.json({ ok: true });
    }
  }
}
