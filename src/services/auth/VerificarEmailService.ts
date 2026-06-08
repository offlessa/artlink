import { HttpStatusCode, ServiceResponse, createError, createSuccess } from "../../../utils/createError";
import prismaClient from "../../prisma";

export class VerificarEmailService {
  async execute(token: string): Promise<ServiceResponse> {
    if (!token?.trim()) {
      return createError("Token é obrigatório.", HttpStatusCode.BAD_REQUEST);
    }

    const usuario = await prismaClient.usuario.findFirst({
      where: {
        emailVerifToken: token.trim(),
        emailVerifExpiry: { gte: new Date() },
      },
    });

    if (!usuario) {
      return createError("Link inválido ou expirado.", HttpStatusCode.BAD_REQUEST);
    }

    await prismaClient.usuario.update({
      where: { id: usuario.id },
      data: { emailVerificado: true, emailVerifToken: null, emailVerifExpiry: null },
    });

    return createSuccess({ mensagem: "E-mail verificado com sucesso!" });
  }
}
