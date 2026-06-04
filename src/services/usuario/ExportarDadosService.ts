import prismaClient from "../../prisma";

export class ExportarDadosService {
  async execute(usuarioId: number) {
    const [usuario, posts, catalogos, mensagensEnviadas, seguidores, seguindo] = await Promise.all([
      prismaClient.usuario.findUnique({
        where: { id: usuarioId },
        select: { id: true, nome: true, username: true, email: true, bio: true, cidade: true, contato: true, criadoEm: true },
      }),
      prismaClient.post.findMany({
        where: { usuarioId },
        select: { id: true, titulo: true, descricao: true, imagem: true, dataPostagem: true },
        orderBy: { dataPostagem: "desc" },
      }),
      prismaClient.catalogo.findMany({
        where: { usuarioId },
        select: { id: true, nome: true, descricao: true, dataCriacao: true },
      }),
      prismaClient.mensagem.findMany({
        where: { remetenteId: usuarioId },
        select: { id: true, conteudo: true, dataEnvio: true, destinatario: { select: { username: true } } },
        orderBy: { dataEnvio: "desc" },
        take: 500,
      }),
      prismaClient.seguidor.findMany({
        where: { seguidoId: usuarioId },
        include: { seguidor: { select: { username: true } } },
      }),
      prismaClient.seguidor.findMany({
        where: { seguidorId: usuarioId },
        include: { seguido: { select: { username: true } } },
      }),
    ]);

    return {
      exportadoEm: new Date().toISOString(),
      perfil: usuario,
      posts,
      catalogos,
      mensagensEnviadas: mensagensEnviadas.map(m => ({
        id: m.id,
        conteudo: m.conteudo,
        dataEnvio: m.dataEnvio,
        para: m.destinatario.username,
      })),
      seguidores: seguidores.map(s => s.seguidor.username),
      seguindo: seguindo.map(s => s.seguido.username),
    };
  }
}
