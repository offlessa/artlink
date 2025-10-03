export interface Usuario {
  id: string;
  nome: string;
  username: string;
  email: string;
  senha: string;
  bio?: string;
  cidade?: string;
  contato?: string;
  fotoPerfil?: string;
  createdAt: Date;
}

export interface UsuarioRequest {
  nome: string;
  username: string;
  email: string;
  senha: string;
  bio?: string;
  cidade?: string;
  contato?: string;
  fotoPerfil?: string;
}
