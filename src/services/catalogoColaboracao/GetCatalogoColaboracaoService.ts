import prismaClient from "../../prisma";

export class GetCatalogoColaboracaoService {
  // Retorna todas as colaborações de catálogos
  async getAll() {
    const colaboracoes = await prismaClient.catalogoColaboracao.findMany({
      include: {
        catalogo: {
          select: {
            id: true,
            nome: true,
            descricao: true,
            usuarioId: true,
          },
        },
        usuario: {
          select: {
            id: true,
            nome: true,
            username: true,
            fotoPerfil: true,
          },
        },
      },
      orderBy: {
        catalogoId: "asc",
      },
    });

    return colaboracoes;
  }

  // Retorna todas as colaborações de um catálogo específico
  async getByCatalogo(catalogoId: number) {
    const colaboracoes = await prismaClient.catalogoColaboracao.findMany({
      where: { catalogoId },
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
    });

    return colaboracoes;
  }

  // Retorna todos os catálogos nos quais um usuário é colaborador
  async getByUsuario(usuarioId: number) {
    const colaboracoes = await prismaClient.catalogoColaboracao.findMany({
      where: { usuarioId },
      include: {
        catalogo: {
          select: {
            id: true,
            nome: true,
            descricao: true,
            usuarioId: true,
          },
        },
      },
    });

    return colaboracoes;
  }
}
