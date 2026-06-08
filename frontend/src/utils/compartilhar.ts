const BASE = (import.meta.env.VITE_APP_URL as string | undefined)?.replace(/\/$/, "");

export function urlPublica(path: string): string {
  const base = BASE ?? window.location.origin;
  return `${base}${path}`;
}

export async function copiarLink(path: string, onSucesso: (msg: string) => void, msg = "Link copiado!") {
  const url = urlPublica(path);
  try {
    await navigator.clipboard.writeText(url);
    onSucesso(msg);
  } catch {
    const el = document.createElement("input");
    el.value = url;
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
    onSucesso(msg);
  }
}
