import {
  HttpStatusCode,
  ServiceResponse,
  createError,
  createSuccess,
} from "../../../utils/createError";
import prismaClient from "../../prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export class LoginService {
  async execute(email: string, senha: string): Promise<ServiceResponse> {
    if (!email || email.trim().length === 0) {
      return createError("E-mail é obrigatório.", HttpStatusCode.BAD_REQUEST);
    }

    if (!senha || senha.trim().length === 0) {
      return createError("Senha é obrigatória.", HttpStatusCode.BAD_REQUEST);
    }

    const usuario = await prismaClient.usuario.findUnique({
      where: { email: email.toLowerCase().trim() },
      select: {
        id: true,
        nome: true,
        username: true,
        email: true,
        senha: true,
        bio: true,
        cidade: true,
        contato: true,
        fotoPerfil: true,
        fotoCapa: true,
        perfilConfig: true,
        configuracoes: true,
        criadoEm: true,
        emailVerificado: true,
      },
    });

    if (!usuario) {
      return createError(
        "E-mail ou senha inválidos.",
        HttpStatusCode.UNAUTHORIZED
      );
    }

    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
    if (!senhaCorreta) {
      return createError(
        "E-mail ou senha inválidos.",
        HttpStatusCode.UNAUTHORIZED
      );
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return createError(
        "Erro de configuração do servidor.",
        HttpStatusCode.INTERNAL_SERVER_ERROR
      );
    }

    const token = jwt.sign(
      { id: usuario.id, username: usuario.username },
      secret,
      { expiresIn: "7d" }
    );

    const { senha: _, emailVerificado: __, ...usuarioSemSenha } = usuario;

    return createSuccess({ token, usuario: usuarioSemSenha }, HttpStatusCode.OK);
  }
}
