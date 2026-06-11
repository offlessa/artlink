import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import path from "path";
import { router } from "./routes";
import cors from "cors";
import { ogMiddleware } from "./og";

const app = express();
app.use(express.json({ limit: "10mb" }));
app.use(cors());

// Injeta OG meta tags para crawlers de redes sociais (WhatsApp, Telegram, etc.)
app.use(ogMiddleware);

// Rotas da API
app.use(router);

// Serve os arquivos estáticos do frontend
const FRONTEND = path.resolve(__dirname, "../../frontend/dist");
app.use(express.static(FRONTEND));

// SPA fallback — tudo que não bateu com API nem arquivo estático devolve o index.html
app.use((_req, res) => {
  res.sendFile(path.join(FRONTEND, "index.html"));
});

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof Error) {
    return res.status(400).json({ error: err.message });
  }

  return res
    .status(500)
    .json({ status: "error", message: "Internal server error" });
});

const PORT = process.env.PORT ?? 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
