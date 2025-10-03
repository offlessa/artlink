import {
  HttpStatusCode,
  ServiceResponse,
  createError,
  createSuccess,
} from "../../../utils/createError";
import prismaClient from "../../prisma";
import bcrypt from "bcrypt";
import { UsuarioRequest } from "../../types/Usuario";

export class CreateUsuarioService {
  async execute({
    nome,
    username,
    email,
    senha,
    bio,
    cidade,
    contato,
    fotoPerfil,
  }: UsuarioRequest): Promise<ServiceResponse> {
    if (!email || email.trim().length === 0) {
      return createError(
        "Parâmetro email é obrigatório.",
        HttpStatusCode.BAD_REQUEST
      );
    }

    if (!nome || nome.trim().length === 0) {
      return createError(
        "Parâmetro nome é obrigatório.",
        HttpStatusCode.BAD_REQUEST
      );
    }

    if (!username || username.trim().length === 0) {
      return createError(
        "Parâmetro username é obrigatório.",
        HttpStatusCode.BAD_REQUEST
      );
    }

    if (!senha || senha.trim().length === 0) {
      return createError(
        "Parâmetro senha é obrigatório.",
        HttpStatusCode.BAD_REQUEST
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return createError(
        "Formato de e-mail inválido.",
        HttpStatusCode.BAD_REQUEST
      );
    }

    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(username)) {
      return createError(
        "Username apenas pode conter letras, números e underline.",
        HttpStatusCode.BAD_REQUEST
      );
    }

    if (username.length < 3 || username.length > 50) {
      return createError(
        "Username deve ter de 3 a 50 caracteres.",
        HttpStatusCode.BAD_REQUEST
      );
    }

    if (senha.length < 6) {
      return createError(
        "Senha deve ter no mínimo 6 caracteres.",
        HttpStatusCode.BAD_REQUEST
      );
    }

    if (nome.length < 1 || nome.length > 100) {
      return createError(
        "Nome deve ter entre 1 e 100 caracteres.",
        HttpStatusCode.BAD_REQUEST
      );
    }

    const emailAlreadyExists = await prismaClient.usuario.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (emailAlreadyExists) {
      return createError("E-mail já cadastrado.", HttpStatusCode.CONFLICT);
    }

    const usernameAlreadyExists = await prismaClient.usuario.findUnique({
      where: { username: username.toLowerCase() },
    });

    if (usernameAlreadyExists) {
      return createError("Nome de usuário já existe.", HttpStatusCode.CONFLICT);
    }

    if (bio && bio.length > 160) {
      return createError(
        "Bio excede o máximo de 160 caracteres.",
        HttpStatusCode.BAD_REQUEST
      );
    }

    try {
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(senha, saltRounds);

      const user = await prismaClient.usuario.create({
        data: {
          nome: nome.trim(),
          username: username.toLowerCase().trim(),
          email: email.toLowerCase().trim(),
          senha: hashedPassword,
          bio: bio?.trim() || null,
          cidade: cidade?.trim() || null,
          contato: contato?.trim() || null,
          fotoPerfil: fotoPerfil?.trim() || null,
        },
        select: {
          id: true,
          email: true,
          nome: true,
          username: true,
          bio: true,
          cidade: true,
          contato: true,
          fotoPerfil: true,
          criadoEm: true,
        },
      });

      return createSuccess(user);
    } catch (error) {
      console.error("Erro ao criar usuário:", error);
      return createError(
        "Erro no servidor.",
        HttpStatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }
}
