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

    const result = await cloudinary.uploader.upload(dataUrl, {
      folder: "artlink",
      transformation: [{ quality: "auto", fetch_format: "auto" }],
    });

    return res.json({ url: result.secure_url });
  }
}
