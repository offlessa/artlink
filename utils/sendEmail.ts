import { Resend } from "resend";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  if (!process.env.RESEND_API_KEY) {
    console.log("\n─────────────────────────────────────────");
    console.log(`[EMAIL] Para: ${to}`);
    console.log(`[EMAIL] Assunto: ${subject}`);
    const codeMatch = html.match(/(\d{6})/);
    if (codeMatch) console.log(`[EMAIL] Código: ${codeMatch[1]}`);
    const linkMatch = html.match(/href="(https?:\/\/[^"]+)"/);
    if (linkMatch) console.log(`[EMAIL] Link: ${linkMatch[1]}`);
    console.log("─────────────────────────────────────────\n");
    return;
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  await resend.emails.send({
    from: process.env.EMAIL_FROM ?? "Artlink <onboarding@resend.dev>",
    to,
    subject,
    html,
  });
}
