import prismaClient from "../../prisma";

export class DeleteUsuarioService {
  async execute(usuarioId: number) {
    try {
      const usuario = await prismaClient.usuario.findUnique({
        where: { id: usuarioId },
      });

      if (!usuario) {
        return { success: false, message: "Usuário não encontrado" };
      }

      await prismaClient.usuario.delete({
        where: { id: usuarioId },
      });

      return { success: true, message: "Usuário deletado com sucesso" };
    } catch (error: any) {
      console.error("Erro ao deletar usuário:", error);
      return { success: false, message: "Erro ao deletar usuário" };
    }
  }
}
