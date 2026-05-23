export type CatalogoRequest = {
  usuarioId: number;
  nome: string;
  descricao?: string;
};

export type UpdateCatalogoRequest = {
  id: number;
  nome?: string;
  descricao?: string;
  capa?: string;
};
