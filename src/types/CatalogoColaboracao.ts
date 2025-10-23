export type CatalogoColaboracaoRequest = {
  catalogoId: number;
  usuarioId: number;
};

export type UpdateCatalogoColaboracaoRequest = {
  catalogoId: number;
  usuarioId: number;
  novoUsuarioId?: number; // se for atualizar usuário
};
