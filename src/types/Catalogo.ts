export interface Catalogo {
  id: number;
  usuarioId: number;
  nome: string;
  descricao?: string | null;
  dataCriacao: Date;
}

export interface CatalogoRequest {
  usuarioId: number;
  nome: string;
  descricao?: string | null;
}
