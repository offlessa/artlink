export function isVideo(url: string): boolean {
  return url.includes("/video/upload/") || /\.(mp4|webm|mov|ogg)(\?|$)/i.test(url);
}
