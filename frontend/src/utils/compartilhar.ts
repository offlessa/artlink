const BASE = (import.meta.env.VITE_APP_URL as string | undefined)?.replace(/\/$/, "");

export function urlPublica(path: string): string {
  const base = BASE ?? window.location.origin;
  return `${base}${path}`;
}

export async function copiarLink(path: string, onSucesso: (msg: string) => void) {
  const url = urlPublica(path);
  try {
    await navigator.clipboard.writeText(url);
    onSucesso("Link copiado!");
  } catch {
    // fallback: seleciona o texto para cópia manual
    const el = document.createElement("input");
    el.value = url;
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
    onSucesso("Link copiado!");
  }
}
