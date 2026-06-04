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
  privacidade: {
    contaPrivada: boolean;
    quemPodeMensagem: "todos" | "seguidos" | "ninguem";
    quemPodeConvidar: "todos" | "seguidos";
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
  seguranca: {
    doisFatores: boolean;
  };
  mensagens: {
    confirmarLeitura: boolean;
    limitePararaTodos: number;
  };
  regiao: {
    idioma: "pt-BR" | "en-US";
    formatoData: "DD/MM/YYYY" | "MM/DD/YYYY" | "YYYY-MM-DD";
  };
}

export const DEFAULT_CONFIG: Configuracoes = {
  notificacoes: {
    ativas: true, curtida: true, comentario: true, seguindo: true,
    colaboracao: true, colaboracao_catalogo: true, mensagem: true, som: true,
  },
  privacidade: { contaPrivada: false, quemPodeMensagem: "todos", quemPodeConvidar: "todos" },
  aparencia: { tema: "claro", tamanhoFonte: "medio", densidadeFeed: "normal" },
  feed: { mostrarDescoberta: true, ordem: "recente" },
  seguranca: { doisFatores: false },
  mensagens: { confirmarLeitura: true, limitePararaTodos: 7 },
  regiao: { idioma: "pt-BR", formatoData: "DD/MM/YYYY" },
};

export function parseConfiguracoes(raw?: string): Configuracoes {
  if (!raw) return DEFAULT_CONFIG;
  try {
    const parsed = JSON.parse(raw);
    return {
      notificacoes: { ...DEFAULT_CONFIG.notificacoes, ...(parsed.notificacoes ?? {}) },
      privacidade:  { ...DEFAULT_CONFIG.privacidade,  ...(parsed.privacidade  ?? {}) },
      aparencia:    { ...DEFAULT_CONFIG.aparencia,    ...(parsed.aparencia    ?? {}) },
      feed:         { ...DEFAULT_CONFIG.feed,         ...(parsed.feed         ?? {}) },
      seguranca:    { ...DEFAULT_CONFIG.seguranca,    ...(parsed.seguranca    ?? {}) },
      mensagens:    { ...DEFAULT_CONFIG.mensagens,    ...(parsed.mensagens    ?? {}) },
      regiao:       { ...DEFAULT_CONFIG.regiao,       ...(parsed.regiao       ?? {}) },
    };
  } catch { return DEFAULT_CONFIG; }
}

export function useConfiguracoes() {
  const { usuario } = useAuth();
  const config = parseConfiguracoes(usuario?.configuracoes);

  useEffect(() => {
    const html = document.documentElement;

    // Tema
    const tema = config.aparencia.tema;
    if (tema === "sistema") {
      const prefDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      html.setAttribute("data-tema", prefDark ? "escuro" : "claro");
    } else {
      html.setAttribute("data-tema", tema === "escuro" ? "escuro" : "claro");
    }

    // Escala de fonte
    html.setAttribute("data-fonte", config.aparencia.tamanhoFonte);

    // Densidade do feed
    html.setAttribute("data-densidade", config.aparencia.densidadeFeed);
  }, [config.aparencia.tema, config.aparencia.tamanhoFonte, config.aparencia.densidadeFeed]);

  return config;
}
