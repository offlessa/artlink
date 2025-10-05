export interface Post {
  id: number;
  usuarioId: number;
  titulo: string;
  descricao?: string | null;
  imagem?: string | null;
  dataPostagem: Date;
}

export interface PostRequest {
  usuarioId: number;
  titulo: string;
  descricao?: string;
  imagem?: string;
}
