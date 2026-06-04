import { Request, Response } from "express";
import { CatalogoSalvoService } from "../../services/catalogoSalvo/CatalogoSalvoService";

export class CatalogoSalvoController {
  async salvar(req: Request, res: Response) {
    try {
      const { usuarioId, catalogoId } = req.body;
      const result = await new CatalogoSalvoService().salvar(Number(usuarioId), Number(catalogoId));
      return res.status(201).json(result);
    } catch (error: any) {
      if (error?.code === "P2002") return res.status(409).json({ message: "Catálogo já salvo" });
      return res.status(500).json({ message: "Erro ao salvar catálogo" });
    }
  }

  async remover(req: Request, res: Response) {
    try {
      const { usuarioId, catalogoId } = req.params;
      await new CatalogoSalvoService().remover(Number(usuarioId), Number(catalogoId));
      return res.json({ message: "Removido dos salvos" });
    } catch {
      return res.status(500).json({ message: "Erro ao remover catálogo dos salvos" });
    }
  }

  async getSalvos(req: Request, res: Response) {
    try {
      const { usuarioId } = req.params;
      const catalogos = await new CatalogoSalvoService().getSalvos(Number(usuarioId));
      return res.json(catalogos);
    } catch {
      return res.status(500).json({ message: "Erro ao buscar catálogos salvos" });
    }
  }

  async checar(req: Request, res: Response) {
    try {
      const { usuarioId, catalogoId } = req.params;
      const result = await new CatalogoSalvoService().checar(Number(usuarioId), Number(catalogoId));
      return res.json(result);
    } catch {
      return res.status(500).json({ message: "Erro ao checar" });
    }
  }
}
