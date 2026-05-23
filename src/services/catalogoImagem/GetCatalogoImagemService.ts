import prismaClient from "../../prisma";

export class GetCatalogoImagemService {
  async getByCatalogo(catalogoId: number) {
    return await prismaClient.catalogoImagem.findMany({
      where: { catalogoId },
      orderBy: { dataCriacao: "asc" },
    });
  }
}
