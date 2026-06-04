import bcrypt from "bcrypt";
import prismaClient from "../../prisma";
import {
  HttpStatusCode, ServiceResponse, createError, createSuccess,
} from "../../../utils/createError";

export class AlterarSenhaService {
  async execute(usuarioId: number, senhaAtual: string, novaSenha: string): Promise<ServiceResponse> {
    if (!senhaAtual || !novaSenha) {
      return createError("Senha atual e nova senha são obrigatórias.", HttpStatusCode.BAD_REQUEST);
    }
    if (novaSenha.length < 6) {
      return createError("A nova senha deve ter pelo menos 6 caracteres.", HttpStatusCode.BAD_REQUEST);
    }

    const usuario = await prismaClient.usuario.findUnique({
      where: { id: usuarioId },
      select: { senha: true },
    });
    if (!usuario) return createError("Usuário não encontrado.", HttpStatusCode.NOT_FOUND);

    const senhaCorreta = await bcrypt.compare(senhaAtual, usuario.senha);
    if (!senhaCorreta) return createError("Senha atual incorreta.", HttpStatusCode.UNAUTHORIZED);

    const hash = await bcrypt.hash(novaSenha, 10);
    await prismaClient.usuario.update({ where: { id: usuarioId }, data: { senha: hash } });
    return createSuccess({ message: "Senha alterada com sucesso." });
  }
}
