import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";

export interface Configuracoes {
  notificacoes: {
    ativas: boolean;
    curtida: boolean;
    comentario: boolean;
    seguindo: boolean;
    colaboracao: boolean;
    colaboracao_catalogo: boolean;
    mensagem: boolean;
    som: boolean;
  };
  aparencia: {
    tema: "claro" | "escuro" | "sistema";
    tamanhoFonte: "pequeno" | "medio" | "grande";
    densidadeFeed: "confortavel" | "normal" | "compacto";
  };
  feed: {
    mostrarDescoberta: boolean;
    ordem: "recente" | "engajamento";
  };
  regiao: {
    idioma: "pt-BR" | "en-US";
  };
}

export const DEFAULT_CONFIG: Configuracoes = {
  notificacoes: {
    ativas: true, curtida: true, comentario: true, seguindo: true,
    colaboracao: true, colaboracao_catalogo: true, mensagem: true, som: true,
  },
  aparencia: { tema: "claro", tamanhoFonte: "medio", densidadeFeed: "normal" },
  feed: { mostrarDescoberta: true, ordem: "recente" },
  regiao: { idioma: "pt-BR" },
};

export function parseConfiguracoes(raw?: string): Configuracoes {
  if (!raw) return DEFAULT_CONFIG;
  try {
    const parsed = JSON.parse(raw);
    return {
      notificacoes: { ...DEFAULT_CONFIG.notificacoes, ...(parsed.notificacoes ?? {}) },
      aparencia:    { ...DEFAULT_CONFIG.aparencia,    ...(parsed.aparencia    ?? {}) },
      feed:         { ...DEFAULT_CONFIG.feed,         ...(parsed.feed         ?? {}) },
      regiao:       { ...DEFAULT_CONFIG.regiao,       ...(parsed.regiao       ?? {}) },
    };
  } catch { return DEFAULT_CONFIG; }
}

export function useConfiguracoes() {
  const { usuario } = useAuth();
  const config = parseConfiguracoes(usuario?.configuracoes);

  useEffect(() => {
    const html = document.documentElement;

    const tema = config.aparencia.tema;
    if (tema === "sistema") {
      const prefDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      html.setAttribute("data-tema", prefDark ? "escuro" : "claro");
    } else {
      html.setAttribute("data-tema", tema === "escuro" ? "escuro" : "claro");
    }

    html.setAttribute("data-fonte", config.aparencia.tamanhoFonte);
    html.setAttribute("data-densidade", config.aparencia.densidadeFeed);
  }, [config.aparencia.tema, config.aparencia.tamanhoFonte, config.aparencia.densidadeFeed]);

  return config;
}
