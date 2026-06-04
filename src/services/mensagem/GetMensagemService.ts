import prismaClient from "../../prisma";

const incluirParticipantes = {
  remetente:    { select: { id: true, nome: true, username: true, fotoPerfil: true } },
  destinatario: { select: { id: true, nome: true, username: true, fotoPerfil: true } },
  deletadasPorMim: { select: { usuarioId: true } },
};

export class GetMensagemService {
  async getByDestinatario(destinatarioId: number) {
    const configs = await prismaClient.conversaConfig.findMany({ where: { usuarioId: destinatarioId } });
    const deletadasConv = new Map(configs.map(c => [c.outroUsuarioId, c.deletadaEm]));

    const mensagens = await prismaClient.mensagem.findMany({
      where: { destinatarioId },
      include: incluirParticipantes,
      orderBy: { dataEnvio: "desc" },
    });

    return mensagens.filter(m => {
      if (m.deletadasPorMim.some(d => d.usuarioId === destinatarioId)) return false;
      const deletadaEm = deletadasConv.get(m.remetenteId);
      return !deletadaEm || new Date(m.dataEnvio) > deletadaEm;
    });
  }

  async getByRemetente(remetenteId: number) {
    const configs = await prismaClient.conversaConfig.findMany({ where: { usuarioId: remetenteId } });
    const deletadasConv = new Map(configs.map(c => [c.outroUsuarioId, c.deletadaEm]));

    const mensagens = await prismaClient.mensagem.findMany({
      where: { remetenteId },
      include: incluirParticipantes,
      orderBy: { dataEnvio: "desc" },
    });

    return mensagens.filter(m => {
      if (m.deletadasPorMim.some(d => d.usuarioId === remetenteId)) return false;
      const deletadaEm = deletadasConv.get(m.destinatarioId);
      return !deletadaEm || new Date(m.dataEnvio) > deletadaEm;
    });
  }

  async contarNaoLidas(destinatarioId: number) {
    const configs = await prismaClient.conversaConfig.findMany({
      where: { usuarioId: destinatarioId, solicitacao: { not: "recebida" } },
    });
    const deletadasConv = new Map(configs.map(c => [c.outroUsuarioId, c.deletadaEm]));

    const mensagens = await prismaClient.mensagem.findMany({
      where: { destinatarioId, status: "nao_lido" },
      include: { deletadasPorMim: { select: { usuarioId: true } } },
    });

    return mensagens.filter(m => {
      if (m.deletadasPorMim.some(d => d.usuarioId === destinatarioId)) return false;
      const deletadaEm = deletadasConv.get(m.remetenteId);
      return !deletadaEm || new Date(m.dataEnvio) > deletadaEm;
    }).length;
  }

  async getConfigs(usuarioId: number) {
    return prismaClient.conversaConfig.findMany({
      where: { usuarioId },
    });
  }
}
