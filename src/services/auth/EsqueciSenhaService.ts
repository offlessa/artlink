import { HttpStatusCode, ServiceResponse, createError, createSuccess } from "../../../utils/createError";
import prismaClient from "../../prisma";
import bcrypt from "bcrypt";
import { sendEmail } from "../../../utils/sendEmail";

export class EsqueciSenhaService {
  async execute(email: string): Promise<ServiceResponse> {
    if (!email?.trim()) {
      return createError("E-mail é obrigatório.", HttpStatusCode.BAD_REQUEST);
    }

    const usuario = await prismaClient.usuario.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    // Não revelamos se o e-mail existe ou não (segurança)
    if (!usuario) {
      return createSuccess(
        { mensagem: "Se esse e-mail estiver cadastrado, você receberá o código." },
        HttpStatusCode.OK
      );
    }

    const codigo = Math.floor(100000 + Math.random() * 900000).toString();
    const hash = await bcrypt.hash(codigo, 8);
    const expiry = new Date(Date.now() + 30 * 60 * 1000); // 30 min

    await prismaClient.usuario.update({
      where: { id: usuario.id },
      data: { resetToken: hash, resetTokenExpiry: expiry },
    });

    await sendEmail({
      to: email,
      subject: "Código de verificação — Artlink",
      html: `
        <div style="font-family:'Segoe UI',sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#FAF8F3;border-radius:12px;">
          <h2 style="color:#2A3B1C;font-size:1.4rem;margin-bottom:8px;">Redefinição de senha</h2>
          <p style="color:#546248;margin-bottom:24px;">Use o código abaixo para redefinir sua senha. Ele é válido por <strong>30 minutos</strong>.</p>
          <div style="font-size:2.2rem;font-weight:700;letter-spacing:12px;color:#2A3B1C;padding:20px;background:#EBF0E4;border-radius:8px;text-align:center;">${codigo}</div>
          <p style="color:#8A9E7A;font-size:0.82rem;margin-top:24px;">Se você não solicitou isso, ignore este e-mail.</p>
        </div>
      `,
    });

    return createSuccess(
      { mensagem: "Se esse e-mail estiver cadastrado, você receberá o código." },
      HttpStatusCode.OK
    );
  }
}
