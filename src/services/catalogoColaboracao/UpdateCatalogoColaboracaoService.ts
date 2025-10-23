// src/services/catalogoColaboracao/UpdateCatalogoColaboracaoService.ts
import prismaClient from "../../prisma";
import { CatalogoColaboracaoRequest } from "../../types/CatalogoColaboracao";

export class UpdateCatalogoColaboracaoService {
  async execute({ catalogoId, usuarioId }: CatalogoColaboracaoRequest) {
    // Aqui normalmente você atualizaria campos da colaboração
    // Mas pelo seu schema do Prisma, CatalogoColaboracao só tem catalogoId e usuarioId
    // Então vamos verificar se a colaboração existe antes de atualizar
    const colaboracaoExistente =
      await prismaClient.catalogoColaboracao.findUnique({
        where: { catalogoId_usuarioId: { catalogoId, usuarioId } },
      });

    if (!colaboracaoExistente) {
      throw new Error("Colaboração não encontrada");
    }

    // Aqui você poderia atualizar outros campos se existissem
    // No momento apenas retornamos a colaboração
    return colaboracaoExistente;
  }
}
