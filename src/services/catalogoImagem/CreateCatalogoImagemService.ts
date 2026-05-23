import prismaClient from "../../prisma";

export class CreateCatalogoImagemService {
  async execute({ catalogoId, imagem }: { catalogoId: number; imagem: string }) {
    return await prismaClient.catalogoImagem.create({
      data: { catalogoId, imagem },
    });
  }
}
