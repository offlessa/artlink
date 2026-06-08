import {
  HttpStatusCode,
  ServiceResponse,
  createError,
  createSuccess,
} from "../../../utils/createError";
import prismaClient from "../../prisma";
import bcrypt from "bcrypt";
import { UsuarioRequest } from "../../types/Usuario";
import { randomUUID } from "crypto";
import { sendEmail } from "../../../utils/sendEmail";

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
      const verifToken = randomUUID();
      const verifExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

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
          emailVerificado: false,
          emailVerifToken: verifToken,
          emailVerifExpiry: verifExpiry,
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

      const frontendUrl = process.env.FRONTEND_URL ?? "http://localhost:5173";
      const link = `${frontendUrl}/verificar-email?token=${verifToken}`;
      await sendEmail({
        to: email,
        subject: "Confirme seu e-mail — Artlink",
        html: `
          <div style="font-family:'Segoe UI',sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#FAF8F3;border-radius:12px;">
            <h2 style="color:#2A3B1C;font-size:1.4rem;margin-bottom:8px;">Olá, ${nome.trim()}!</h2>
            <p style="color:#546248;margin-bottom:24px;">Clique no botão abaixo para confirmar seu e-mail e ativar sua conta no Artlink.</p>
            <a href="${link}" style="display:inline-block;padding:14px 28px;background:#4A7C59;color:#FAF8F3;border-radius:8px;text-decoration:none;font-weight:700;font-size:1rem;">Confirmar e-mail</a>
            <p style="color:#8A9E7A;font-size:0.82rem;margin-top:24px;">O link expira em <strong>24 horas</strong>. Se você não criou essa conta, ignore este e-mail.</p>
            <p style="color:#B0C4A0;font-size:0.75rem;margin-top:8px;">Ou copie e cole: ${link}</p>
          </div>
        `,
      }).catch(() => { /* não bloquear o cadastro se o e-mail falhar */ });

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
