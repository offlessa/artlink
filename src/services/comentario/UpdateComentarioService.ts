import prismaClient from "../../prisma";
import { UpdateComentarioRequest } from "../../types/Comentario";

export class UpdateComentarioService {
  async execute({ id, conteudo }: UpdateComentarioRequest) {
    // Confirma que o comentário existe
    const comentarioExistente = await prismaClient.comentario.findUnique({
      where: { id },
    });

    if (!comentarioExistente) {
      throw new Error("Comentário não encontrado");
    }

    // Atualiza o conteúdo do comentário
    const comentarioAtualizado = await prismaClient.comentario.update({
      where: { id },
      data: { conteudo },
    });

    return comentarioAtualizado;
  }
}
