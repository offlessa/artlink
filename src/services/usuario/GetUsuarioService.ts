import prismaClient from "../../prisma";

export class GetUsuarioService {
  // Pega todos os usuários
  async getAll() {
    try {
      const usuarios = await prismaClient.usuario.findMany({
        select: {
          id: true,
          nome: true,
          username: true,
          email: true,
          bio: true,
          cidade: true,
          contato: true,
          fotoPerfil: true,
          criadoEm: true,
        },
        orderBy: {
          criadoEm: "desc",
        },
      });

      return usuarios;
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
      throw new Error("Erro ao buscar usuários");
    }
  }

  // Pega um usuário pelo ID
  async getById(id: number) {
    try {
      const usuario = await prismaClient.usuario.findUnique({
        where: { id },
        select: {
          id: true,
          nome: true,
          username: true,
          email: true,
          bio: true,
          cidade: true,
          contato: true,
          fotoPerfil: true,
          criadoEm: true,
        },
      });

      return usuario;
    } catch (error) {
      console.error("Erro ao buscar usuário:", error);
      throw new Error("Erro ao buscar usuário");
    }
  }

  // Pega um usuário pelo username
  async getByUsername(username: string) {
    try {
      const usuario = await prismaClient.usuario.findUnique({
        where: { username },
        select: {
          id: true,
          nome: true,
          username: true,
          email: true,
          bio: true,
          cidade: true,
          contato: true,
          fotoPerfil: true,
          criadoEm: true,
        },
      });

      return usuario;
    } catch (error) {
      console.error("Erro ao buscar usuário:", error);
      throw new Error("Erro ao buscar usuário");
    }
  }
}
