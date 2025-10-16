import { api } from './api'

export interface UsuarioData {
  nome: string
  email: string
  senha: string
}

export async function createUsuario(data: UsuarioData) {
  const res = await api.post('/usuario', data)
  return res.data
}
