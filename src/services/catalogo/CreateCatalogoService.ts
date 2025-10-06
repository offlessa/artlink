import prismaClient from "../../prisma";
import { CatalogoRequest } from "../../types/Catalogo";

export class CreateCatalogoService {
  async execute({ usuarioId, nome, descricao }: CatalogoRequest) {
    const catalogo = await prismaClient.catalogo.create({
      data: {
        usuarioId,
        nome,
        ...(descricao !== undefined ? { descricao } : {}),
      },
    });

    return catalogo;
  }
}
