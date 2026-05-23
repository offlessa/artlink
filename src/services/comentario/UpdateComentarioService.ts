import prismaClient from "../../prisma";

export class UpdateComentarioService {
  async execute({ id, conteudo, oculto }: { id: number; conteudo?: string; oculto?: boolean }) {
    const existe = await prismaClient.comentario.findUnique({ where: { id } });
    if (!existe) throw new Error("Comentário não encontrado");

    return prismaClient.comentario.update({
      where: { id },
      data: {
        ...(conteudo !== undefined && { conteudo }),
        ...(oculto !== undefined && { oculto }),
      },
    });
  }
}
