import { api } from "./api";

export async function uploadImagem(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await api.post("/upload", formData);
  const url = res.data?.url ?? res.data?.data?.url;
  if (!url) throw new Error("Servidor não retornou URL da imagem.");
  return url as string;
}
