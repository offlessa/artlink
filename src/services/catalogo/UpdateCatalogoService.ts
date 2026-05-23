import prismaClient from "../../prisma";
import { UpdateCatalogoRequest } from "../../types/Catalogo";

export class UpdateCatalogoService {
  async execute({ id, nome, descricao, capa }: UpdateCatalogoRequest) {
    // Confirma que o catálogo existe
    const catalogoExistente = await prismaClient.catalogo.findUnique({
      where: { id },
    });

    if (!catalogoExistente) {
      throw new Error("Catálogo não encontrado");
    }

    // Atualiza apenas os campos fornecidos
    const catalogoAtualizado = await prismaClient.catalogo.update({
      where: { id },
      data: {
        ...(nome !== undefined ? { nome } : {}),
        ...(descricao !== undefined ? { descricao } : {}),
        ...(capa !== undefined ? { capa } : {}),
      },
    });

    return catalogoAtualizado;
  }
}
