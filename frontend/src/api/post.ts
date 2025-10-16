import { api } from './api'

export interface PostData {
  usuarioId: string
  conteudo: string
  imagemUrl?: string
}

export async function createPost(data: PostData) {
  const res = await api.post('/post', data)
  return res.data
}
