import prismaClient from "../../prisma";

export class GetMensagemService {
  // Buscar mensagens recebidas por um usuário
  async getByDestinatario(destinatarioId: number) {
    return prismaClient.mensagem.findMany({
      where: { destinatarioId },
      include: {
        remetente: {
          select: { id: true, nome: true, username: true, fotoPerfil: true },
        },
        destinatario: {
          select: { id: true, nome: true, username: true, fotoPerfil: true },
        },
      },
      orderBy: { dataEnvio: "desc" },
    });
  }

  // Buscar mensagens enviadas por um usuário
  async getByRemetente(remetenteId: number) {
    return prismaClient.mensagem.findMany({
      where: { remetenteId },
      include: {
        remetente: {
          select: { id: true, nome: true, username: true, fotoPerfil: true },
        },
        destinatario: {
          select: { id: true, nome: true, username: true, fotoPerfil: true },
        },
      },
      orderBy: { dataEnvio: "desc" },
    });
  }

  async contarNaoLidas(destinatarioId: number) {
    return prismaClient.mensagem.count({
      where: { destinatarioId, status: "nao_lido" },
    });
  }

  // Opcional: buscar todas mensagens
  async getAll() {
    return prismaClient.mensagem.findMany({
      include: {
        remetente: {
          select: { id: true, nome: true, username: true, fotoPerfil: true },
        },
        destinatario: {
          select: { id: true, nome: true, username: true, fotoPerfil: true },
        },
      },
      orderBy: { dataEnvio: "desc" },
    });
  }
}
