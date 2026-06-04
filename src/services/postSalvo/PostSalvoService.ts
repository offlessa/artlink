import prismaClient from "../../prisma";

const incluirAutor = {
  select: { id: true, nome: true, username: true, fotoPerfil: true },
};

export class PostSalvoService {
  async salvar(usuarioId: number, postId: number) {
    return prismaClient.postSalvo.create({ data: { usuarioId, postId } });
  }

  async remover(usuarioId: number, postId: number) {
    return prismaClient.postSalvo.delete({
      where: { usuarioId_postId: { usuarioId, postId } },
    });
  }

  async getSalvos(usuarioId: number) {
    const salvos = await prismaClient.postSalvo.findMany({
      where: { usuarioId },
      include: {
        post: {
          include: {
            autor: incluirAutor,
            curtidas: true,
            comentarios: true,
          },
        },
      },
      orderBy: { salvadoEm: "desc" },
    });
    return salvos.map(s => s.post);
  }

  async checar(usuarioId: number, postId: number) {
    const salvo = await prismaClient.postSalvo.findUnique({
      where: { usuarioId_postId: { usuarioId, postId } },
    });
    return { salvo: !!salvo };
  }
}
