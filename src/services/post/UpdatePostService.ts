import prismaClient from "../../prisma";

export class UpdatePostService {
  async execute(
    id: number,
    novosDados: { titulo?: string; descricao?: string; imagem?: string }
  ) {
    // Verifica se o post existe
    const postExistente = await prismaClient.post.findUnique({
      where: { id },
    });

    if (!postExistente) {
      throw new Error("Post não encontrado");
    }

    // Atualiza os campos fornecidos
    const postAtualizado = await prismaClient.post.update({
      where: { id },
      data: novosDados,
    });

    return postAtualizado;
  }
}
