import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/api";
import { uploadImagem } from "../api/upload";
import { useAuth } from "../context/AuthContext";
import { useI18n } from "../hooks/useI18n";
import { SendIcon, MessageIcon, ImageIcon, XIcon, ArchiveIcon, TrashIcon, ArrowLeftIcon, HeartIcon, CheckIcon, PencilIcon, CheckSquareIcon } from "../components/Icons";
import FotoLightbox from "../components/FotoLightbox";
import "../styles/components/Mensagens.scss";

interface Usuario {
  id: number;
  nome: string;
  username: string;
  fotoPerfil?: string;
}

interface Mensagem {
  id: number;
  remetenteId: number;
  destinatarioId: number;
  conteudo: string;
  imagem?: string;
  dataEnvio: string;
  status: "nao_lido" | "lido";
  apagadaParaTodos: boolean;
  curtida: boolean;
  editado: boolean;
  remetente: Usuario;
  destinatario: Usuario;
}

interface ConversaConfig {
  outroUsuarioId: number;
  solicitacao: "nenhuma" | "recebida" | "enviada";
  arquivada: boolean;
  deletadaEm?: string | null;
}

interface Conversa {
  usuario: Usuario;
  ultimaMensagem: Mensagem;
  naoLidas: number;
  solicitacao: "nenhuma" | "recebida" | "enviada";
  arquivada: boolean;
}

type Aba = "mensagens" | "solicitacoes" | "arquivadas";

export default function Mensagens() {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const t = useI18n();

  const [conversas, setConversas] = useState<Conversa[]>([]);
  const [conversaSelecionada, setConversaSelecionada] = useState<Usuario | null>(null);
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [texto, setTexto] = useState("");
  const [imagemPreview, setImagemPreview] = useState<string | null>(null);
  const [imagemFile, setImagemFile] = useState<File | null>(null);
  const [buscaUsuario, setBuscaUsuario] = useState("");
  const [resultadosBusca, setResultadosBusca] = useState<Usuario[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [aba, setAba] = useState<Aba>("mensagens");
  const [configs, setConfigs] = useState<ConversaConfig[]>([]);
  const [menuConversa, setMenuConversa] = useState<number | null>(null);
  const [menuMensagem, setMenuMensagem] = useState<number | null>(null);
  const [apagando, setApagando] = useState<number | null>(null);
  const [respondendo, setRespondendo] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [editando, setEditando] = useState<{ id: number } | null>(null);
  const [modoSelecao, setModoSelecao] = useState(false);
  const [selecionadas, setSelecionadas] = useState<Set<number>>(new Set());

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fotoInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!usuario) { navigate("/login"); return; }
    carregarTudo();
  }, [usuario]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens]);

  useEffect(() => {
    if (!conversaSelecionada || !usuario) return;
    carregarMensagens(conversaSelecionada.id);
    const interval = setInterval(() => carregarMensagens(conversaSelecionada.id), 5000);
    return () => clearInterval(interval);
  }, [conversaSelecionada?.id]);

  useEffect(() => {
    function fechar(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuConversa(null);
      }
    }
    document.addEventListener("mousedown", fechar);
    return () => document.removeEventListener("mousedown", fechar);
  }, []);

  useEffect(() => {
    function onEscape(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      if (editando) cancelarEdicao();
      else if (modoSelecao) sairSelecao();
    }
    document.addEventListener("keydown", onEscape);
    return () => document.removeEventListener("keydown", onEscape);
  }, [editando, modoSelecao]);

  useEffect(() => {
    if (editando) inputRef.current?.focus();
  }, [editando]);

  async function carregarTudo() {
    if (!usuario) return;
    const [recebidas, enviadas, cfgs] = await Promise.all([
      api.get(`/mensagem/destinatario/${usuario.id}`).catch(() => ({ data: [] })),
      api.get(`/mensagem/remetente/${usuario.id}`).catch(() => ({ data: [] })),
      api.get(`/mensagem/configs/${usuario.id}`).catch(() => ({ data: [] })),
    ]);

    const configsArr: ConversaConfig[] = Array.isArray(cfgs.data) ? cfgs.data : [];
    setConfigs(configsArr);
    const configMap = new Map(configsArr.map(c => [c.outroUsuarioId, c]));

    const todasMensagens: Mensagem[] = [
      ...(Array.isArray(recebidas.data) ? recebidas.data : []),
      ...(Array.isArray(enviadas.data) ? enviadas.data : []),
    ];

    const mapa = new Map<number, Conversa>();
    for (const m of todasMensagens) {
      const outroId = m.remetenteId === usuario.id ? m.destinatarioId : m.remetenteId;
      const outro = m.remetenteId === usuario.id ? m.destinatario : m.remetente;
      const cfg = configMap.get(outroId);

      if (cfg?.deletadaEm && new Date(m.dataEnvio) <= new Date(cfg.deletadaEm)) continue;

      const naoLida = m.destinatarioId === usuario.id && m.status === "nao_lido" ? 1 : 0;
      const existing = mapa.get(outroId);
      if (!existing || new Date(m.dataEnvio) > new Date(existing.ultimaMensagem.dataEnvio)) {
        mapa.set(outroId, {
          usuario: outro,
          ultimaMensagem: m,
          naoLidas: (existing?.naoLidas ?? 0) + naoLida,
          solicitacao: cfg?.solicitacao ?? "nenhuma",
          arquivada: cfg?.arquivada ?? false,
        });
      } else if (naoLida) {
        existing.naoLidas += 1;
      }
    }

    setConversas(Array.from(mapa.values()).sort(
      (a, b) => new Date(b.ultimaMensagem.dataEnvio).getTime() - new Date(a.ultimaMensagem.dataEnvio).getTime()
    ));
  }

  async function carregarMensagens(outroId: number) {
    if (!usuario) return;
    const [recebidas, enviadas] = await Promise.all([
      api.get(`/mensagem/destinatario/${usuario.id}`).catch(() => ({ data: [] })),
      api.get(`/mensagem/remetente/${usuario.id}`).catch(() => ({ data: [] })),
    ]);
    const todas: Mensagem[] = [
      ...(Array.isArray(recebidas.data) ? recebidas.data : []),
      ...(Array.isArray(enviadas.data) ? enviadas.data : []),
    ];
    const cfg = configs.find(c => c.outroUsuarioId === outroId);
    const conversa = todas.filter(m => {
      const pertence = (m.remetenteId === usuario.id && m.destinatarioId === outroId) ||
                       (m.remetenteId === outroId && m.destinatarioId === usuario.id);
      if (!pertence) return false;
      if (cfg?.deletadaEm && new Date(m.dataEnvio) <= new Date(cfg.deletadaEm)) return false;
      return true;
    }).sort((a, b) => new Date(a.dataEnvio).getTime() - new Date(b.dataEnvio).getTime());
    setMensagens(conversa);
    for (const m of conversa) {
      if (m.destinatarioId === usuario.id && m.status === "nao_lido") {
        api.put(`/mensagem/${m.id}`, { status: "lido" }).catch(() => {});
      }
    }
  }

  async function enviarMensagem(e: React.FormEvent) {
    e.preventDefault();
    if ((!texto.trim() && !imagemFile) || !conversaSelecionada || !usuario || enviando) return;
    setEnviando(true);
    try {
      let imagemUrl: string | undefined;
      if (imagemFile) {
        imagemUrl = await uploadImagem(imagemFile);
      }
      await api.post("/mensagem", {
        remetenteId: usuario.id,
        destinatarioId: conversaSelecionada.id,
        conteudo: texto.trim() || "",
        imagem: imagemUrl,
      });
      setTexto("");
      setImagemFile(null);
      setImagemPreview(null);
      await carregarMensagens(conversaSelecionada.id);
      carregarTudo();
    } catch { /* silencioso */ } finally {
      setEnviando(false);
    }
  }

  function selecionarImagem(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImagemFile(file);
    setImagemPreview(URL.createObjectURL(file));
    e.target.value = "";
  }

  function removerImagemPreview() {
    setImagemFile(null);
    if (imagemPreview) URL.revokeObjectURL(imagemPreview);
    setImagemPreview(null);
  }

  async function buscarUsuarios(q: string) {
    setBuscaUsuario(q);
    if (!q.trim()) { setResultadosBusca([]); return; }
    setBuscando(true);
    try {
      const res = await api.get("/usuario");
      const todos: Usuario[] = res.data?.data ?? res.data ?? [];
      setResultadosBusca(
        todos.filter(u => u.id !== usuario?.id &&
          (u.nome.toLowerCase().includes(q.toLowerCase()) || u.username.toLowerCase().includes(q.toLowerCase()))
        ).slice(0, 6)
      );
    } catch { setResultadosBusca([]); }
    finally { setBuscando(false); }
  }

  function iniciarConversa(u: Usuario) {
    setConversaSelecionada(u);
    setBuscaUsuario("");
    setResultadosBusca([]);
    cancelarEdicao();
    sairSelecao();
    const cfg = configs.find(c => c.outroUsuarioId === u.id);
    if (cfg?.solicitacao === "recebida") setAba("solicitacoes");
    else if (cfg?.arquivada) setAba("arquivadas");
    else setAba("mensagens");
  }

  async function aceitarSolicitacao(outroId: number) {
    setRespondendo(true);
    try {
      await api.patch(`/mensagem/conversa/${outroId}/aceitar`);
      await carregarTudo();
      setAba("mensagens");
    } catch { /* silencioso */ } finally { setRespondendo(false); }
  }

  async function recusarSolicitacao(outroId: number) {
    setRespondendo(true);
    try {
      await api.patch(`/mensagem/conversa/${outroId}/recusar`);
      if (conversaSelecionada?.id === outroId) setConversaSelecionada(null);
      await carregarTudo();
    } catch { /* silencioso */ } finally { setRespondendo(false); }
  }

  async function arquivarConversa(outroId: number) {
    setMenuConversa(null);
    try {
      await api.patch(`/mensagem/conversa/${outroId}/arquivar`);
      if (conversaSelecionada?.id === outroId) setConversaSelecionada(null);
      await carregarTudo();
    } catch { /* silencioso */ }
  }

  async function desarquivarConversa(outroId: number) {
    setMenuConversa(null);
    try {
      await api.patch(`/mensagem/conversa/${outroId}/desarquivar`);
      await carregarTudo();
    } catch { /* silencioso */ }
  }

  async function deletarConversa(outroId: number) {
    setMenuConversa(null);
    if (!confirm(t.messages.deleteConfirm)) return;
    try {
      await api.patch(`/mensagem/conversa/${outroId}/deletar`);
      if (conversaSelecionada?.id === outroId) setConversaSelecionada(null);
      await carregarTudo();
    } catch { /* silencioso */ }
  }

  async function curtirMensagem(id: number, curtida: boolean) {
    setMensagens(prev => prev.map(m => m.id === id ? { ...m, curtida } : m));
    try {
      await api.put(`/mensagem/${id}`, { curtida });
    } catch {
      setMensagens(prev => prev.map(m => m.id === id ? { ...m, curtida: !curtida } : m));
    }
  }

  // ── EDITAR ────────────────────────────────────────
  function iniciarEdicao(m: Mensagem) {
    setMenuMensagem(null);
    setTexto(m.conteudo);
    setEditando({ id: m.id });
  }

  function cancelarEdicao() {
    setEditando(null);
    setTexto("");
  }

  async function salvarEdicao() {
    if (!editando || !texto.trim()) return;
    const id = editando.id;
    const novoConteudo = texto.trim();
    setEditando(null);
    setTexto("");
    setMensagens(prev => prev.map(m => m.id === id ? { ...m, conteudo: novoConteudo, editado: true } : m));
    try {
      await api.put(`/mensagem/${id}`, { conteudo: novoConteudo });
    } catch {}
  }

  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editando) salvarEdicao();
    else enviarMensagem(e);
  }

  function podeEditar(m: Mensagem) {
    return m.remetenteId === usuario?.id && !m.apagadaParaTodos && !!m.conteudo;
  }

  // ── SELEÇÃO MÚLTIPLA ──────────────────────────────
  function toggleSelecao(id: number) {
    setSelecionadas(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function sairSelecao() {
    setModoSelecao(false);
    setSelecionadas(new Set());
  }

  async function apagarSelecionadasParaMim() {
    const ids = Array.from(selecionadas);
    sairSelecao();
    setMensagens(prev => prev.filter(m => !ids.includes(m.id)));
    await Promise.all(ids.map(id => api.delete(`/mensagem/${id}/para-mim`).catch(() => {})));
  }

  async function apagarSelecionadasParaTodos() {
    const ids = Array.from(selecionadas);
    const snap = [...mensagens];
    sairSelecao();
    setMensagens(prev => prev.reduce<Mensagem[]>((acc, m) => {
      if (!ids.includes(m.id)) return [...acc, m];
      if (m.remetenteId === usuario?.id && !m.apagadaParaTodos) {
        return [...acc, { ...m, apagadaParaTodos: true, conteudo: "", imagem: undefined }];
      }
      return acc; // mensagens recebidas: remove da view (para-mim)
    }, []));
    await Promise.all(ids.map(async id => {
      const m = snap.find(msg => msg.id === id);
      if (!m) return;
      if (m.remetenteId === usuario?.id && !m.apagadaParaTodos) {
        await api.delete(`/mensagem/${id}/para-todos`).catch(() => {});
      } else {
        await api.delete(`/mensagem/${id}/para-mim`).catch(() => {});
      }
    }));
  }

  async function apagarParaMim(mensagemId: number) {
    setMenuMensagem(null);
    setApagando(mensagemId);
    try {
      await api.delete(`/mensagem/${mensagemId}/para-mim`);
      setMensagens(prev => prev.filter(m => m.id !== mensagemId));
    } catch { /* silencioso */ } finally { setApagando(null); }
  }

  async function apagarParaTodos(mensagemId: number) {
    setMenuMensagem(null);
    setApagando(mensagemId);
    try {
      await api.delete(`/mensagem/${mensagemId}/para-todos`);
      setMensagens(prev => prev.map(m =>
        m.id === mensagemId ? { ...m, apagadaParaTodos: true, conteudo: "", imagem: undefined } : m
      ));
    } catch { /* silencioso */ } finally { setApagando(null); }
  }

  function podePararTodos(m: Mensagem): boolean {
    if (m.remetenteId !== usuario?.id) return false;
    if (m.apagadaParaTodos) return false;
    return Date.now() - new Date(m.dataEnvio).getTime() <= 7 * 60 * 1000;
  }

  function formatarData(iso: string) {
    const d = new Date(iso);
    const hoje = new Date();
    if (d.toDateString() === hoje.toDateString())
      return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
  }

  const inicial = (nome: string) => nome.charAt(0).toUpperCase();

  const conversasFiltradas = conversas.filter(c => {
    if ((c.solicitacao as string) === "recusada") return false;
    if (aba === "solicitacoes") return c.solicitacao === "recebida";
    if (aba === "arquivadas") return c.arquivada;
    return !c.arquivada && c.solicitacao !== "recebida";
  });

  const totalSolicitacoes = conversas.filter(c => c.solicitacao === "recebida").length;

  const configDaConversa = conversaSelecionada
    ? configs.find(c => c.outroUsuarioId === conversaSelecionada.id)
    : null;
  const conversaEhSolicitacao = configDaConversa?.solicitacao === "recebida";
  const conversaEhEnviada = configDaConversa?.solicitacao === "enviada";
  const conversaArquivada = configDaConversa?.arquivada ?? false;

  const temMinhasSelecionadas = Array.from(selecionadas).some(id => {
    const m = mensagens.find(msg => msg.id === id);
    return m && m.remetenteId === usuario?.id && !m.apagadaParaTodos;
  });

  return (
    <div className={`msgs${conversaSelecionada ? " msgs--conversa-ativa" : ""}`}>
      {/* SIDEBAR */}
      <aside className="msgs__sidebar">
        <div className="msgs__sidebar-header">
          <h2>{t.messages.title}</h2>
        </div>

        <div className="msgs__abas">
          <button
            className={`msgs__aba ${aba === "mensagens" ? "msgs__aba--ativa" : ""}`}
            onClick={() => setAba("mensagens")}
          >
            {t.messages.tabMessages}
          </button>
          <button
            className={`msgs__aba ${aba === "solicitacoes" ? "msgs__aba--ativa" : ""}`}
            onClick={() => setAba("solicitacoes")}
          >
            {t.messages.tabRequests}
            {totalSolicitacoes > 0 && (
              <span className="msgs__aba-badge">{totalSolicitacoes}</span>
            )}
          </button>
          <button
            className={`msgs__aba ${aba === "arquivadas" ? "msgs__aba--ativa" : ""}`}
            onClick={() => setAba("arquivadas")}
          >
            {t.messages.tabArchived}
          </button>
        </div>

        <div className="msgs__busca-wrap">
          <input
            type="text"
            placeholder={t.messages.searchPerson}
            value={buscaUsuario}
            onChange={e => buscarUsuarios(e.target.value)}
            className="msgs__busca"
          />
          {resultadosBusca.length > 0 && (
            <div className="msgs__busca-resultados">
              {resultadosBusca.map(u => (
                <button key={u.id} className="msgs__busca-item" onClick={() => iniciarConversa(u)}>
                  <div className="msgs__avatar msgs__avatar--sm">
                    {u.fotoPerfil ? <img src={u.fotoPerfil} alt={u.nome} /> : <span>{inicial(u.nome)}</span>}
                  </div>
                  <div>
                    <p className="msgs__nome">{u.nome}</p>
                    <p className="msgs__username">@{u.username}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="msgs__lista">
          {conversasFiltradas.length === 0 && (
            <div className="msgs__vazio">
              <MessageIcon size={32} />
              <p>{aba === "solicitacoes" ? t.messages.noRequests : aba === "arquivadas" ? t.messages.noArchived : t.messages.noConversations}</p>
              {aba === "mensagens" && <span>{t.messages.searchHint}</span>}
            </div>
          )}
          {conversasFiltradas.map(c => (
            <div
              key={c.usuario.id}
              className={`msgs__conversa-wrap ${conversaSelecionada?.id === c.usuario.id ? "msgs__conversa-wrap--ativa" : ""}`}
            >
              <button
                className="msgs__conversa"
                onClick={() => iniciarConversa(c.usuario)}
              >
                <div className="msgs__avatar">
                  {c.usuario.fotoPerfil
                    ? <img src={c.usuario.fotoPerfil} alt={c.usuario.nome} />
                    : <span>{inicial(c.usuario.nome)}</span>}
                </div>
                <div className="msgs__conversa-info">
                  <div className="msgs__conversa-top">
                    <span className="msgs__nome">{c.usuario.nome}</span>
                    <span className="msgs__data">{formatarData(c.ultimaMensagem.dataEnvio)}</span>
                  </div>
                  <div className="msgs__conversa-bottom">
                    <span className="msgs__preview">
                      {c.ultimaMensagem.remetenteId === usuario?.id ? t.messages.you : ""}
                      {c.ultimaMensagem.imagem && !c.ultimaMensagem.conteudo
                        ? t.messages.photo
                        : c.ultimaMensagem.conteudo.length > 30
                          ? c.ultimaMensagem.conteudo.slice(0, 30) + "..."
                          : c.ultimaMensagem.conteudo}
                    </span>
                    <div className="msgs__conversa-badges">
                      {c.solicitacao === "enviada" && (
                        <span className="msgs__badge-pendente">{t.messages.pending}</span>
                      )}
                      {c.naoLidas > 0 && <span className="msgs__badge">{c.naoLidas}</span>}
                    </div>
                  </div>
                </div>
              </button>
              <div className="msgs__menu-wrap" ref={menuConversa === c.usuario.id ? menuRef : null}>
                <button
                  className="msgs__menu-btn"
                  onClick={e => { e.stopPropagation(); setMenuConversa(menuConversa === c.usuario.id ? null : c.usuario.id); }}
                  title="Opções"
                >
                  ⋯
                </button>
                {menuConversa === c.usuario.id && (
                  <div className="msgs__menu-dropdown">
                    {c.arquivada ? (
                      <button onClick={() => desarquivarConversa(c.usuario.id)}>
                        <ArchiveIcon size={13} /> {t.messages.unarchive}
                      </button>
                    ) : (
                      <button onClick={() => arquivarConversa(c.usuario.id)}>
                        <ArchiveIcon size={13} /> {t.messages.archive}
                      </button>
                    )}
                    <button className="msgs__menu-deletar" onClick={() => deletarConversa(c.usuario.id)}>
                      <TrashIcon size={13} /> {t.messages.deleteConversation}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* CHAT */}
      <main className="msgs__chat">
        {!conversaSelecionada ? (
          <div className="msgs__chat-vazio">
            <MessageIcon size={48} />
            <p>{t.messages.selectConversation}</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="msgs__chat-header">
              <button
                className="msgs__back-btn"
                onClick={() => setConversaSelecionada(null)}
                aria-label="Voltar"
              >
                <ArrowLeftIcon size={18} />
              </button>
              <div className="msgs__avatar msgs__avatar--sm">
                {conversaSelecionada.fotoPerfil
                  ? <img src={conversaSelecionada.fotoPerfil} alt={conversaSelecionada.nome} />
                  : <span>{inicial(conversaSelecionada.nome)}</span>}
              </div>
              <div className="msgs__chat-header-info">
                <p className="msgs__nome">{conversaSelecionada.nome}</p>
                <p className="msgs__username">@{conversaSelecionada.username}</p>
              </div>
              {conversaEhEnviada && (
                <span className="msgs__pendente-tag">{t.messages.waitingReply}</span>
              )}
              {conversaArquivada && (
                <button className="msgs__desarquivar-btn" onClick={() => desarquivarConversa(conversaSelecionada.id)}>
                  {t.messages.unarchive}
                </button>
              )}
              {/* Botão selecionar / cancelar seleção */}
              {mensagens.length > 0 && !conversaEhSolicitacao && (
                modoSelecao ? (
                  <button className="msgs__selecionar-btn msgs__selecionar-btn--ativo" onClick={sairSelecao}>
                    Cancelar
                  </button>
                ) : (
                  <button className="msgs__selecionar-btn" onClick={() => setModoSelecao(true)} title="Selecionar mensagens">
                    <CheckSquareIcon size={16} />
                  </button>
                )
              )}
            </div>

            {/* Banner de solicitação recebida */}
            {conversaEhSolicitacao && (
              <div className="msgs__solicitacao-banner">
                <p>{t.messages.requestBanner(conversaSelecionada.username)}</p>
                <div className="msgs__solicitacao-acoes">
                  <button
                    className="msgs__sol-aceitar"
                    onClick={() => aceitarSolicitacao(conversaSelecionada.id)}
                    disabled={respondendo}
                  >
                    {respondendo ? "..." : t.messages.accept}
                  </button>
                  <button
                    className="msgs__sol-recusar"
                    onClick={() => recusarSolicitacao(conversaSelecionada.id)}
                    disabled={respondendo}
                  >
                    {t.messages.reject}
                  </button>
                </div>
              </div>
            )}

            {/* Lista de mensagens */}
            <div className="msgs__mensagens">
              {mensagens.length === 0 && (
                <div className="msgs__chat-vazio msgs__chat-vazio--inline">
                  <p>{t.messages.startConversation}</p>
                </div>
              )}
              {mensagens.map(m => {
                const sou = m.remetenteId === usuario?.id;
                const selecionada = selecionadas.has(m.id);
                return (
                  <div
                    key={m.id}
                    className={`msgs__balao-wrap ${sou ? "msgs__balao-wrap--eu" : "msgs__balao-wrap--outro"} ${modoSelecao ? "msgs__balao-wrap--modo-sel" : ""} ${modoSelecao && selecionada ? "msgs__balao-wrap--selecionada" : ""} ${apagando === m.id ? "msgs__balao--apagando" : ""}`}
                    onClick={modoSelecao ? () => toggleSelecao(m.id) : undefined}
                    onMouseLeave={() => { if (!modoSelecao && menuMensagem === m.id) setMenuMensagem(null); }}
                  >
                    {/* Checkbox de seleção */}
                    {modoSelecao && (
                      <div
                        className={`msgs__checkbox${selecionada ? " msgs__checkbox--marcado" : ""}`}
                        onClick={e => { e.stopPropagation(); toggleSelecao(m.id); }}
                      >
                        {selecionada && <CheckIcon size={11} />}
                      </div>
                    )}

                    {/* Menu de ações da mensagem */}
                    {!modoSelecao && !m.apagadaParaTodos && (
                      <div className="msgs__balao-menu-wrap">
                        <button
                          className="msgs__balao-menu-btn"
                          onClick={() => setMenuMensagem(menuMensagem === m.id ? null : m.id)}
                          disabled={apagando === m.id}
                        >
                          ⋯
                        </button>
                        {menuMensagem === m.id && (
                          <div className={`msgs__balao-dropdown ${sou ? "msgs__balao-dropdown--eu" : "msgs__balao-dropdown--outro"}`}>
                            {podeEditar(m) && (
                              <button onClick={() => iniciarEdicao(m)}>
                                <PencilIcon size={13} /> Editar
                              </button>
                            )}
                            <button onClick={() => apagarParaMim(m.id)}>
                              {t.messages.deleteForMe}
                            </button>
                            {podePararTodos(m) && (
                              <button className="msgs__balao-drop-todos" onClick={() => apagarParaTodos(m.id)}>
                                {t.messages.deleteForAll}
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    <div className={`msgs__balao ${sou ? "msgs__balao--eu" : "msgs__balao--outro"} ${editando?.id === m.id ? "msgs__balao--editando" : ""}`}>
                      {m.apagadaParaTodos ? (
                        <p className="msgs__balao-apagada">{t.messages.deletedMessage}</p>
                      ) : (
                        <>
                          {m.imagem && (
                            <img
                              src={m.imagem}
                              alt="imagem"
                              className="msgs__balao-img"
                              onClick={modoSelecao ? undefined : () => setLightboxSrc(m.imagem!)}
                            />
                          )}
                          {m.conteudo && <p>{m.conteudo}</p>}
                        </>
                      )}
                      <div className="msgs__balao-footer">
                        {!modoSelecao && !sou && !m.apagadaParaTodos && (
                          <button
                            className={`msgs__heart-btn${m.curtida ? " msgs__heart-btn--ativo" : ""}`}
                            onClick={e => { e.stopPropagation(); curtirMensagem(m.id, !m.curtida); }}
                            title={m.curtida ? "Descurtir" : "Curtir"}
                          >
                            <HeartIcon size={11} filled={m.curtida} />
                          </button>
                        )}
                        {!modoSelecao && sou && m.curtida && !m.apagadaParaTodos && (
                          <span className="msgs__heart-recebido">
                            <HeartIcon size={10} filled />
                          </span>
                        )}
                        {m.editado && !m.apagadaParaTodos && (
                          <span className="msgs__editado">editado</span>
                        )}
                        <span className="msgs__balao-data">{formatarData(m.dataEnvio)}</span>
                        {sou && !m.apagadaParaTodos && (
                          <span className={`msgs__ticks${m.status === "lido" ? " msgs__ticks--lido" : ""}`}>
                            {m.status === "lido" ? "✓✓" : "✓"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Banner de edição */}
            {editando && (
              <div className="msgs__edit-banner">
                <PencilIcon size={14} />
                <span>Editando mensagem</span>
                <button onClick={cancelarEdicao} title="Cancelar edição">
                  <XIcon size={15} />
                </button>
              </div>
            )}

            {/* Preview de imagem */}
            {imagemPreview && (
              <div className="msgs__img-preview">
                <img src={imagemPreview} alt="preview" />
                <button className="msgs__img-preview-rm" onClick={removerImagemPreview}>
                  <XIcon size={14} />
                </button>
              </div>
            )}

            {/* Formulário ou barra de seleção */}
            {modoSelecao ? (
              <div className="msgs__acao-bar">
                <span className="msgs__acao-bar__count">
                  {selecionadas.size} {selecionadas.size === 1 ? "selecionada" : "selecionadas"}
                </span>
                <button
                  className="msgs__acao-bar__mim"
                  onClick={apagarSelecionadasParaMim}
                  disabled={selecionadas.size === 0}
                >
                  Apagar para mim
                </button>
                <button
                  className="msgs__acao-bar__todos"
                  onClick={apagarSelecionadasParaTodos}
                  disabled={selecionadas.size === 0}
                  title={temMinhasSelecionadas ? undefined : "Nenhuma mensagem sua selecionada"}
                >
                  Apagar para todos
                </button>
              </div>
            ) : (
              <form
                className={`msgs__form ${conversaEhSolicitacao ? "msgs__form--bloqueado" : ""} ${editando ? "msgs__form--editando" : ""}`}
                onSubmit={conversaEhSolicitacao ? e => e.preventDefault() : handleFormSubmit}
              >
                {!conversaEhSolicitacao && !editando && (
                  <>
                    <button
                      type="button"
                      className="msgs__foto-btn"
                      onClick={() => fotoInputRef.current?.click()}
                      title="Enviar foto"
                      disabled={enviando}
                    >
                      <ImageIcon size={18} />
                    </button>
                    <input
                      ref={fotoInputRef}
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={selecionarImagem}
                    />
                  </>
                )}
                <input
                  ref={inputRef}
                  type="text"
                  placeholder={conversaEhSolicitacao ? t.messages.requestPlaceholder : editando ? "Editar mensagem..." : t.messages.messagePlaceholder}
                  value={texto}
                  onChange={e => setTexto(e.target.value)}
                  className="msgs__input"
                  disabled={enviando || conversaEhSolicitacao}
                />
                {!conversaEhSolicitacao && (
                  <button
                    type="submit"
                    className={`msgs__enviar${editando ? " msgs__enviar--editar" : ""}`}
                    disabled={(!texto.trim() && !imagemFile) || enviando}
                  >
                    {editando ? <CheckIcon size={18} /> : <SendIcon size={18} />}
                  </button>
                )}
              </form>
            )}
          </>
        )}
      </main>
      {lightboxSrc && <FotoLightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />}
    </div>
  );
}
