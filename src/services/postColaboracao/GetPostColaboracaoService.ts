import prismaClient from "../../prisma";

const incluirAutor = {
  select: { id: true, nome: true, username: true, fotoPerfil: true },
};

export class GetPostColaboracaoService {
  // Posts onde o usuário é colaborador aceito (para exibir no perfil)
  async getByUsuario(usuarioId: number) {
    try {
      const colaboracoes = await prismaClient.postColaboracao.findMany({
        where: { usuarioId, status: "aceito" },
        include: {
          post: {
            include: {
              autor: incluirAutor,
              curtidas: true,
              comentarios: true,
              colaboracoes: {
                where: { status: "aceito" },
                include: { usuario: incluirAutor },
              },
            },
          },
        },
      });

      return colaboracoes.map(c => c.post);
    } catch (error) {
      console.error("Erro ao buscar posts de colaboração:", error);
      throw new Error("Erro ao buscar posts de colaboração");
    }
  }

  async getByPost(postId: number) {
    try {
      const colaboracoes = await prismaClient.postColaboracao.findMany({
        where: { postId },
        include: {
          usuario: incluirAutor,
        },
      });

      return colaboracoes;
    } catch (error) {
      console.error("Erro ao buscar colaboradores do post:", error);
      throw new Error("Erro ao buscar colaboradores do post");
    }
  }
}
