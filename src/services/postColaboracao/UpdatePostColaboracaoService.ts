import prismaClient from "../../prisma";

export class UpdatePostColaboracaoService {
  async execute(postId: number, colaboradores: { usuarioId: number }[]) {
    // Verifica se o post existe
    const postExistente = await prismaClient.post.findUnique({
      where: { id: postId },
    });

    if (!postExistente) {
      throw new Error("Post não encontrado");
    }

    // Remove todas as colaborações antigas do post
    await prismaClient.postColaboracao.deleteMany({
      where: { postId },
    });

    // Cria novas colaborações
    const novasColaboracoes = colaboradores.map((c) => ({
      postId,
      usuarioId: c.usuarioId,
    }));

    const resultado = await prismaClient.postColaboracao.createMany({
      data: novasColaboracoes,
    });

    return {
      message: "Colaborações atualizadas com sucesso",
      count: resultado.count,
    };
  }
}
