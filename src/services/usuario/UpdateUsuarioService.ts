import prismaClient from "../../prisma";

export interface UpdateUsuarioRequest {
  id: number;
  nome?: string;
  username?: string;
  email?: string;
  senha?: string;
  bio?: string;
  cidade?: string;
  contato?: string;
  fotoPerfil?: string;
}

export class UpdateUsuarioService {
  async execute({
    id,
    nome,
    username,
    email,
    senha,
    bio,
    cidade,
    contato,
    fotoPerfil,
  }: UpdateUsuarioRequest) {
    // Verifica se o usuário existe
    const usuarioExistente = await prismaClient.usuario.findUnique({
      where: { id },
    });

    if (!usuarioExistente) {
      throw new Error("Usuário não encontrado");
    }

    // Atualiza os campos fornecidos
    const usuarioAtualizado = await prismaClient.usuario.update({
      where: { id },
      data: {
        ...(nome && { nome }),
        ...(username && { username }),
        ...(email && { email }),
        ...(senha && { senha }),
        ...(bio && { bio }),
        ...(cidade && { cidade }),
        ...(contato && { contato }),
        ...(fotoPerfil && { fotoPerfil }),
      },
    });

    return usuarioAtualizado;
  }
}
