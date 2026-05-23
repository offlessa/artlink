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
  fotoCapa?: string;
  perfilConfig?: string;
}

export class UpdateUsuarioService {
  async execute({ id, nome, username, email, senha, bio, cidade, contato, fotoPerfil, fotoCapa, perfilConfig }: UpdateUsuarioRequest) {
    const usuarioExistente = await prismaClient.usuario.findUnique({ where: { id } });
    if (!usuarioExistente) throw new Error("Usuário não encontrado");

    return prismaClient.usuario.update({
      where: { id },
      data: {
        ...(nome !== undefined && { nome }),
        ...(username !== undefined && { username }),
        ...(email !== undefined && { email }),
        ...(senha !== undefined && { senha }),
        ...(bio !== undefined && { bio: bio || null }),
        ...(cidade !== undefined && { cidade: cidade || null }),
        ...(contato !== undefined && { contato: contato || null }),
        ...(fotoPerfil !== undefined && { fotoPerfil: fotoPerfil || null }),
        ...(fotoCapa !== undefined && { fotoCapa: fotoCapa || null }),
        ...(perfilConfig !== undefined && { perfilConfig: perfilConfig || null }),
      },
    });
  }
}
