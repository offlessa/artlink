const VERIFICADOS = ["offlessa"];

export function isVerificado(username?: string): boolean {
  return !!username && VERIFICADOS.includes(username.toLowerCase());
}
