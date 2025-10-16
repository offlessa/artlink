import { api } from './api'

export interface MensagemData {
  remetenteId: string
  destinatarioId: string
  conteudo: string
}

export async function enviarMensagem(data: MensagemData) {
  const res = await api.post('/mensagem', data)
  return res.data
}
