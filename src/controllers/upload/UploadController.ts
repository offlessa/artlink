import { Request, Response } from "express";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME ?? "",
  api_key: process.env.CLOUDINARY_API_KEY ?? "",
  api_secret: process.env.CLOUDINARY_API_SECRET ?? "",
});

export class UploadController {
  async handle(req: Request, res: Response) {
    const file = (req as any).file as { buffer: Buffer; mimetype: string } | undefined;
    if (!file) {
      return res.status(400).json({ error: "Nenhum arquivo enviado." });
    }

    const b64 = file.buffer.toString("base64");
    const dataUrl = `data:${file.mimetype};base64,${b64}`;

    const isVideo = file.mimetype.startsWith("video/");

    const uploadOptions: Record<string, unknown> = {
      folder: "artlink",
      resource_type: "auto",
    };
    if (!isVideo) {
      uploadOptions.transformation = [{ quality: "auto", fetch_format: "auto" }];
    }

    try {
      const result = await cloudinary.uploader.upload(dataUrl, uploadOptions as any);
      return res.json({ url: result.secure_url });
    } catch (err: any) {
      console.error("Cloudinary error:", err);
      return res.status(500).json({ message: err?.message ?? "Erro ao fazer upload para o Cloudinary." });
    }
  }
}
