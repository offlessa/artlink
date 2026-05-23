import prismaClient from "../../prisma";

export class DeleteCatalogoImagemService {
  async execute(id: number) {
    return await prismaClient.catalogoImagem.delete({ where: { id } });
  }
}
