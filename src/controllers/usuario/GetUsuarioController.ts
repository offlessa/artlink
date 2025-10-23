import { Request, Response } from "express";
import { GetUsuarioService } from "../../services/usuario/GetUsuarioService";

export class GetUsuarioController {
  // Todos os usuários
  async getAll(req: Request, res: Response) {
    try {
      const service = new GetUsuarioService();
      const usuarios = await service.getAll();
      return res.json(usuarios);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Erro interno do servidor" });
    }
  }

  // Usuário por ID
  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const service = new GetUsuarioService();
      const usuario = await service.getById(Number(id));

      if (!usuario) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }

      return res.json(usuario);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Erro interno do servidor" });
    }
  }
  async getByUsername(req: Request, res: Response) {
    try {
      const username = req.params.username;

      if (!username) {
        return res.status(400).json({ message: "Username é obrigatório" });
      }

      const service = new GetUsuarioService();
      const usuario = await service.getByUsername(username);

      if (!usuario) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }

      return res.json(usuario);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Erro interno do servidor" });
    }
  }
}
