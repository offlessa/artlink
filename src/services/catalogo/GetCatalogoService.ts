import prismaClient from "../../prisma";

export class GetCatalogoService {
  async getAll() {
    const catalogos = await prismaClient.catalogo.findMany({
      include: {
        dono: {
          select: {
            id: true,
            nome: true,
            username: true,
            fotoPerfil: true,
          },
        },
        posts: true,
        colaboracoes: true,
      },
      orderBy: {
        dataCriacao: "desc",
      },
    });

    return catalogos;
  }

  async getById(id: number) {
    const catalogo = await prismaClient.catalogo.findUnique({
      where: { id },
      include: {
        dono: {
          select: {
            id: true,
            nome: true,
            username: true,
            fotoPerfil: true,
          },
        },
        posts: {
          include: {
            post: true,
          },
        },
        colaboracoes: {
          include: {
            usuario: {
              select: {
                id: true,
                nome: true,
                username: true,
                fotoPerfil: true,
              },
            },
          },
        },
      },
    });

    return catalogo;
  }

  async getByUsuario(usuarioId: number) {
    const catalogos = await prismaClient.catalogo.findMany({
      where: { usuarioId },
      include: {
        posts: true,
        colaboracoes: true,
      },
    });

    return catalogos;
  }
}
