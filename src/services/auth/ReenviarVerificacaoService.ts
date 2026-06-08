import { HttpStatusCode, ServiceResponse, createSuccess } from "../../../utils/createError";
import prismaClient from "../../prisma";
import { sendEmail } from "../../../utils/sendEmail";
import { randomUUID } from "crypto";

const MSG_GENERICA = "Se esse e-mail estiver cadastrado e não verificado, reenviamos o link.";

export class ReenviarVerificacaoService {
  async execute(email: string): Promise<ServiceResponse> {
    if (!email?.trim()) {
      return createSuccess({ mensagem: MSG_GENERICA }, HttpStatusCode.OK);
    }

    const usuario = await prismaClient.usuario.findUnique({
      where: { email: email.toLowerCase().trim() },
      select: { id: true, nome: true, emailVerificado: true },
    });

    if (!usuario || usuario.emailVerificado) {
      return createSuccess({ mensagem: MSG_GENERICA }, HttpStatusCode.OK);
    }

    const token = randomUUID();
    const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prismaClient.usuario.update({
      where: { id: usuario.id },
      data: { emailVerifToken: token, emailVerifExpiry: expiry },
    });

    const frontendUrl = process.env.FRONTEND_URL ?? "http://localhost:5173";
    const link = `${frontendUrl}/verificar-email?token=${token}`;

    await sendEmail({
      to: email,
      subject: "Confirme seu e-mail — Artlink",
      html: buildEmail(usuario.nome, link),
    });

    return createSuccess({ mensagem: MSG_GENERICA }, HttpStatusCode.OK);
  }
}

function buildEmail(nome: string, link: string) {
  return `
    <div style="font-family:'Segoe UI',sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#FAF8F3;border-radius:12px;">
      <h2 style="color:#2A3B1C;font-size:1.4rem;margin-bottom:8px;">Olá, ${nome}!</h2>
      <p style="color:#546248;margin-bottom:24px;">Clique no botão abaixo para confirmar seu e-mail e ativar sua conta no Artlink.</p>
      <a href="${link}" style="display:inline-block;padding:14px 28px;background:#4A7C59;color:#FAF8F3;border-radius:8px;text-decoration:none;font-weight:700;font-size:1rem;">Confirmar e-mail</a>
      <p style="color:#8A9E7A;font-size:0.82rem;margin-top:24px;">O link expira em <strong>24 horas</strong>. Se você não criou essa conta, ignore este e-mail.</p>
      <p style="color:#B0C4A0;font-size:0.75rem;margin-top:8px;">Ou copie e cole: ${link}</p>
    </div>
  `;
}
