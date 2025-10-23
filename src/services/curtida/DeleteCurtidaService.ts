import prismaClient from "../../prisma";

export class DeleteCurtidaService {
  async execute(id: number) {
    // Verifica se a curtida existe
    const curtidaExistente = await prismaClient.curtida.findUnique({
      where: { id },
    });

    if (!curtidaExistente) {
      throw new Error("Curtida não encontrada");
    }

    // Deleta a curtida
    await prismaClient.curtida.delete({
      where: { id },
    });

    return { message: "Curtida deletada com sucesso" };
  }
}
