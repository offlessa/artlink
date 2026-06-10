export function isVideo(url: string): boolean {
  return url.includes("/video/upload/") || /\.(mp4|webm|mov|ogg)(\?|$)/i.test(url);
}

export function videoThumbnail(videoUrl: string, custom?: string): string {
  if (custom) return custom;
  return videoUrl
    .replace("/video/upload/", "/video/upload/so_0,w_600/")
    .replace(/\.(mp4|webm|mov|ogg)(\?.*)?$/i, ".jpg");
}
