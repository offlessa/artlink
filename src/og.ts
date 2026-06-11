import { Request, Response, NextFunction } from "express";
import prismaClient from "./prisma";

const BOT_UA = /whatsapp|facebookexternalhit|twitterbot|telegrambot|linkedinbot|discordbot|slackbot|ia_archiver|prerender/i;

const BASE_URL = (process.env.BASE_URL ?? "https://artlink-iwq1.onrender.com").replace(/\/$/, "");
const DEFAULT_IMAGE = `${BASE_URL}/artlink-og.png`;

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function ogHtml(title: string, description: string, image: string, url: string) {
  const t = esc(title), d = esc(description), i = esc(image), u = esc(url);
  return `<!DOCTYPE html><html lang="pt-BR"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${t}</title>
<meta name="description" content="${d}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Artlink">
<meta property="og:title" content="${t}">
<meta property="og:description" content="${d}">
<meta property="og:image" content="${i}">
<meta property="og:url" content="${u}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${t}">
<meta name="twitter:description" content="${d}">
<meta name="twitter:image" content="${i}">
<meta http-equiv="refresh" content="0; url=${u}">
</head><body></body></html>`;
}

export async function ogMiddleware(req: Request, res: Response, next: NextFunction) {
  const ua = req.headers["user-agent"] ?? "";
  if (!BOT_UA.test(ua)) return next();

  try {
    const p = req.path;

    const postMatch = p.match(/^\/post\/(\d+)$/);
    if (postMatch) {
      const post = await prismaClient.post.findUnique({
        where: { id: Number(postMatch[1]) },
        include: { autor: { select: { username: true } } },
      });
      if (post) {
        return res.send(ogHtml(
          `Post de @${post.autor.username} no Artlink`,
          post.descricao ?? post.titulo,
          post.imagem ?? DEFAULT_IMAGE,
          `${BASE_URL}/post/${post.id}`,
        ));
      }
    }

    const userMatch = p.match(/^\/u\/([^/]+)$/);
    if (userMatch) {
      const user = await prismaClient.usuario.findUnique({
        where: { username: userMatch[1] },
        select: { username: true, nome: true, bio: true, fotoPerfil: true },
      });
      if (user) {
        return res.send(ogHtml(
          `Perfil de @${user.username} no Artlink`,
          user.bio ?? `Veja o catálogo de ${user.nome} no Artlink`,
          user.fotoPerfil ?? DEFAULT_IMAGE,
          `${BASE_URL}/u/${user.username}`,
        ));
      }
    }

    const catMatch = p.match(/^\/catalogo\/(\d+)$/);
    if (catMatch) {
      const cat = await prismaClient.catalogo.findUnique({
        where: { id: Number(catMatch[1]) },
        include: { dono: { select: { username: true } } },
      });
      if (cat) {
        return res.send(ogHtml(
          `Catálogo de @${cat.dono.username} no Artlink`,
          cat.descricao ?? `${cat.nome} — catálogo de arte no Artlink`,
          cat.capa ?? DEFAULT_IMAGE,
          `${BASE_URL}/catalogo/${cat.id}`,
        ));
      }
    }
  } catch { /* silencioso — segue para o próximo middleware */ }

  next();
}
