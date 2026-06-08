import { useAuth } from "../context/AuthContext";
import { translations, type T } from "../i18n/translations";
import { parseConfiguracoes } from "./useConfiguracoes";

export function useI18n(): T {
  const { usuario } = useAuth();
  const config = parseConfiguracoes(usuario?.configuracoes);
  return translations[config.regiao.idioma];
}
