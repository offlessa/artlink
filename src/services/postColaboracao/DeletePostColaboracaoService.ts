import prismaClient from "../../prisma";
import {
  createSuccess,
  createError,
  ServiceResponse,
} from "../../../utils/createError";

export class DeletePostColaboracaoService {
  async execute(postId: number, usuarioId: number): Promise<ServiceResponse> {
    try {
      await prismaClient.postColaboracao.delete({
        where: {
          postId_usuarioId: {
            postId,
            usuarioId,
          },
        },
      });

      return createSuccess("Colaboração de post excluída com sucesso");
    } catch (error: any) {
      console.error("Erro ao excluir colaboração do post:", error);
      return createError("Erro ao excluir colaboração do post", 500);
    }
  }
}
