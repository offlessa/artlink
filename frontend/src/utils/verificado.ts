const VERIFICADOS = ["artlink"];

export function isVerificado(username?: string): boolean {
  return !!username && VERIFICADOS.includes(username.toLowerCase());
}
