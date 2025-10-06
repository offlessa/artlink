export interface Comentario {
  id: number;
  usuarioId: number;
  postId: number;
  conteudo: string;
  data: Date;
}

export interface ComentarioRequest {
  usuarioId: number;
  postId: number;
  conteudo: string;
}
