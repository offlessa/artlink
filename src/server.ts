import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import { router } from "./routes";
import cors from "cors";

const app = express();
app.use(express.json({ limit: "10mb" }));
app.use(cors());

app.use(router);

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
