import prismaClient from "../../prisma";

const incluirDono = {
  select: { id: true, nome: true, username: true, fotoPerfil: true },
};

export class CatalogoSalvoService {
  async salvar(usuarioId: number, catalogoId: number) {
    return prismaClient.catalogoSalvo.create({ data: { usuarioId, catalogoId } });
  }

  async remover(usuarioId: number, catalogoId: number) {
    return prismaClient.catalogoSalvo.delete({
      where: { usuarioId_catalogoId: { usuarioId, catalogoId } },
    });
  }

  async getSalvos(usuarioId: number) {
    const salvos = await prismaClient.catalogoSalvo.findMany({
      where: { usuarioId },
      include: {
        catalogo: {
          include: {
            dono: incluirDono,
            posts: true,
            imagens: { select: { imagem: true }, orderBy: { id: "desc" }, take: 1 },
          },
        },
      },
      orderBy: { salvadoEm: "desc" },
    });
    return salvos.map(s => {
      const c = s.catalogo;
      const capaDinamica =
        c.capa ??
        c.imagens[0]?.imagem ??
        null;
      return {
        id: c.id,
        nome: c.nome,
        descricao: c.descricao,
        capa: c.capa,
        capaDinamica,
        usuarioId: c.usuarioId,
        dono: c.dono,
        posts: c.posts,
      };
    });
  }

  async checar(usuarioId: number, catalogoId: number) {
    const salvo = await prismaClient.catalogoSalvo.findUnique({
      where: { usuarioId_catalogoId: { usuarioId, catalogoId } },
    });
    return { salvo: !!salvo };
  }
}
