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

  async getArtistas() {
    const artistas = await prismaClient.usuario.findMany({
      select: {
        ...USER_SELECT,
        _count: { select: { seguidores: true, posts: true } },
        catalogos: {
          select: {
            id: true,
            nome: true,
            capa: true,
            posts: {
              include: { post: { select: { imagem: true } } },
              orderBy: { postId: "desc" },
            },
            imagens: {
              select: { imagem: true },
              orderBy: { id: "desc" },
              take: 1,
            },
          },
          orderBy: { dataCriacao: "desc" },
          take: 4,
        },
      },
    });

    return artistas
      .map(a => {
        const catalogosComCapa = a.catalogos.map(c => ({
          id: c.id,
          nome: c.nome,
          capaDinamica: c.capa
            ?? c.imagens[0]?.imagem
            ?? c.posts.find(p => p.post.imagem)?.post.imagem
            ?? null,
        }));
        return {
          id: a.id, nome: a.nome, username: a.username,
          fotoPerfil: a.fotoPerfil, fotoCapa: a.fotoCapa,
          bio: a.bio, cidade: a.cidade,
          seguidores: a._count.seguidores,
          totalPosts: a._count.posts,
          catalogos: catalogosComCapa,
        };
      })
      .sort((a, b) => b.seguidores - a.seguidores);
  }

  async getById(id: number) {
    return prismaClient.usuario.findUnique({ where: { id }, select: USER_SELECT });
  }

  async getByUsername(username: string) {
    return prismaClient.usuario.findUnique({ where: { username }, select: USER_SELECT });
  }
}
