export interface Curtida {
  id: number;
  usuarioId: number;
  postId: number;
  data: Date;
}

export interface CurtidaRequest {
  usuarioId: number;
  postId: number;
}
