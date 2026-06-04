import prismaClient from "../../prisma";

export class GetCatalogoService {
  async getAll() {
    const catalogos = await prismaClient.catalogo.findMany({
      include: {
        dono: {
          select: { id: true, nome: true, username: true, fotoPerfil: true },
        },
        posts: {
          include: { post: { select: { imagem: true } } },
          orderBy: { postId: "desc" },
        },
        imagens: {
          select: { imagem: true },
          orderBy: { id: "desc" },
          take: 1,
        },
        colaboracoes: true,
      },
      orderBy: { dataCriacao: "desc" },
    });

    return catalogos.map(c => {
      const autoImagem =
        c.imagens[0]?.imagem ??
        c.posts.find(p => p.post.imagem)?.post.imagem ??
        null;
      return { ...c, capaDinamica: c.capa ?? autoImagem };
    });
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
    const [proprios, colabs] = await Promise.all([
      prismaClient.catalogo.findMany({
        where: { usuarioId },
        include: {
          posts: {
            include: { post: { select: { imagem: true } } },
            orderBy: { postId: "desc" },
          },
          imagens: {
            select: { imagem: true },
            orderBy: { id: "desc" },
            take: 1,
          },
          colaboracoes: {
            include: {
              usuario: { select: { id: true, nome: true, username: true, fotoPerfil: true } },
            },
          },
        },
      }),
      prismaClient.catalogoColaboracao.findMany({
        where: { usuarioId, status: "aceito" },
        include: {
          catalogo: {
            include: {
              posts: {
                include: { post: { select: { imagem: true } } },
                orderBy: { postId: "desc" },
              },
              imagens: {
                select: { imagem: true },
                orderBy: { id: "desc" },
                take: 1,
              },
              colaboracoes: {
                include: {
                  usuario: { select: { id: true, nome: true, username: true, fotoPerfil: true } },
                },
              },
            },
          },
        },
      }),
    ]);

    const withDynamic = (c: typeof proprios[0]) => {
      const autoImagem =
        c.imagens[0]?.imagem ??
        c.posts.find(p => p.post.imagem)?.post.imagem ??
        null;
      return { ...c, capaDinamica: c.capa ?? autoImagem, ehColaborador: false };
    };

    const colabCatalogos = colabs.map(col => {
      const c = col.catalogo;
      const autoImagem =
        c.imagens[0]?.imagem ??
        c.posts.find(p => p.post.imagem)?.post.imagem ??
        null;
      return { ...c, capaDinamica: c.capa ?? autoImagem, ehColaborador: true };
    });

    return [...proprios.map(withDynamic), ...colabCatalogos];
  }
}
