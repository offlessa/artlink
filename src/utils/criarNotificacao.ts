import prismaClient from "../prisma";
import { TipoNotificacao } from "../generated/prisma";

const CAMPO_CONFIG: Record<string, string> = {
  curtida: "curtida",
  comentario: "comentario",
  seguindo: "seguindo",
  colaboracao: "colaboracao",
  colaboracao_catalogo: "colaboracao_catalogo",
  mensagem: "mensagem",
};

export async function criarNotificacao(params: {
  usuarioId: number;
  remetenteId: number;
  tipo: TipoNotificacao;
  postId?: number;
  catalogoId?: number;
}) {
  if (params.usuarioId === params.remetenteId) return;

  const destUsuario = await prismaClient.usuario.findUnique({
    where: { id: params.usuarioId },
    select: { configuracoes: true },
  });

  const cfg = destUsuario?.configuracoes ? JSON.parse(destUsuario.configuracoes) : null;
  const notif = cfg?.notificacoes;

  if (notif?.ativas === false) return;

  const campo = CAMPO_CONFIG[params.tipo];
  if (campo && notif?.[campo] === false) return;

  await prismaClient.notificacao.create({
    data: {
      usuarioId: params.usuarioId,
      remetenteId: params.remetenteId,
      tipo: params.tipo,
      postId: params.postId ?? null,
      catalogoId: params.catalogoId ?? null,
    },
  });
}
