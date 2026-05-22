import { HttpStatusCode, ServiceResponse, createError, createSuccess } from "../../../utils/createError";
import prismaClient from "../../prisma";
import bcrypt from "bcrypt";

export class RedefinirSenhaService {
  async execute(email: string, codigo: string, novaSenha: string): Promise<ServiceResponse> {
    if (!email?.trim() || !codigo?.trim() || !novaSenha?.trim()) {
      return createError("Todos os campos são obrigatórios.", HttpStatusCode.BAD_REQUEST);
    }

    if (novaSenha.length < 6) {
      return createError("A senha deve ter pelo menos 6 caracteres.", HttpStatusCode.BAD_REQUEST);
    }

    const usuario = await prismaClient.usuario.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!usuario || !usuario.resetToken || !usuario.resetTokenExpiry) {
      return createError("Código inválido ou expirado.", HttpStatusCode.BAD_REQUEST);
    }

    if (new Date() > usuario.resetTokenExpiry) {
      return createError("Código expirado. Solicite um novo.", HttpStatusCode.BAD_REQUEST);
    }

    const valido = await bcrypt.compare(codigo.trim(), usuario.resetToken);
    if (!valido) {
      return createError("Código incorreto.", HttpStatusCode.BAD_REQUEST);
    }

    const senhaHash = await bcrypt.hash(novaSenha, 10);

    await prismaClient.usuario.update({
      where: { id: usuario.id },
      data: { senha: senhaHash, resetToken: null, resetTokenExpiry: null },
    });

    return createSuccess({ mensagem: "Senha redefinida com sucesso." }, HttpStatusCode.OK);
  }
}
