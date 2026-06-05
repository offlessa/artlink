import prismaClient from "../../prisma";

const selecionarUsuario = {
  select: { id: true, nome: true, username: true, fotoPerfil: true },
};

export class GetCatalogoColaboracaoService {
  async getAll() {
    return prismaClient.catalogoColaboracao.findMany({
      include: { usuario: selecionarUsuario },
    });
  }

  async getByCatalogo(catalogoId: number) {
    return prismaClient.catalogoColaboracao.findMany({
      where: { catalogoId },
      include: { usuario: selecionarUsuario },
      orderBy: { status: "asc" },
    });
  }

  async getByUsuario(usuarioId: number) {
    return prismaClient.catalogoColaboracao.findMany({
      where: { usuarioId },
      include: {
        catalogo: {
          select: { id: true, nome: true, descricao: true, usuarioId: true, capa: true },
        },
      },
    });
  }
}
