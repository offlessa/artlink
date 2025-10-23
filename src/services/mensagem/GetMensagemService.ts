import prismaClient from "../../prisma";

export class GetMensagemService {
  // Buscar todas as mensagens enviadas para um usuário
  async getByDestinatario(destinatarioId: number) {
    try {
      const mensagens = await prismaClient.mensagem.findMany({
        where: { destinatarioId },
        include: {
          remetente: {
            select: {
              id: true,
              nome: true,
              username: true,
              fotoPerfil: true,
            },
          },
        },
        orderBy: { dataEnvio: "desc" },
      });

      return mensagens;
    } catch (error) {
      console.error("Erro ao buscar mensagens do destinatário:", error);
      throw new Error("Erro ao buscar mensagens do destinatário");
    }
  }

  // Buscar todas as mensagens enviadas por um usuário
  async getByRemetente(remetenteId: number) {
    try {
      const mensagens = await prismaClient.mensagem.findMany({
        where: { remetenteId },
        include: {
          destinatario: {
            select: {
              id: true,
              nome: true,
              username: true,
              fotoPerfil: true,
            },
          },
        },
        orderBy: { dataEnvio: "desc" },
      });

      return mensagens;
    } catch (error) {
      console.error("Erro ao buscar mensagens do remetente:", error);
      throw new Error("Erro ao buscar mensagens do remetente");
    }
  }
}
