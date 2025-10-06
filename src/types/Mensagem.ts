export enum StatusMensagem {
  NAO_LIDO = "nao_lido",
  LIDO = "lido",
}

export interface Mensagem {
  id: number;
  remetenteId: number;
  destinatarioId: number;
  conteudo: string;
  dataEnvio: Date;
  status: StatusMensagem;
}

export interface MensagemRequest {
  remetenteId: number;
  destinatarioId: number;
  conteudo: string;
  status?: StatusMensagem;
}
