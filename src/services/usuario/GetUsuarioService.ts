import prismaClient from "../../prisma";

const USER_SELECT = {
  id: true,
  nome: true,
  username: true,
  email: true,
  bio: true,
  cidade: true,
  contato: true,
  fotoPerfil: true,
  fotoCapa: true,
  perfilConfig: true,
  criadoEm: true,
};

export class GetUsuarioService {
  async getAll() {
    return prismaClient.usuario.findMany({
      select: USER_SELECT,
      orderBy: { criadoEm: "desc" },
    });
  }

  async getById(id: number) {
    return prismaClient.usuario.findUnique({ where: { id }, select: USER_SELECT });
  }

  async getByUsername(username: string) {
    return prismaClient.usuario.findUnique({ where: { username }, select: USER_SELECT });
  }
}
