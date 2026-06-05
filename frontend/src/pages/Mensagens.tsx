import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/api";
import { uploadImagem } from "../api/upload";
import { useAuth } from "../context/AuthContext";
import { SendIcon, MessageIcon, ImageIcon, XIcon, ArchiveIcon, TrashIcon } from "../components/Icons";
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

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fotoInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

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

      // Ignorar mensagens antes da data de deleção
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
    // Detectar a aba correta para este usuário
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
    if (!confirm("Deletar esta conversa? As mensagens serão removidas do seu histórico.")) return;
    try {
      await api.patch(`/mensagem/conversa/${outroId}/deletar`);
      if (conversaSelecionada?.id === outroId) setConversaSelecionada(null);
      await carregarTudo();
    } catch { /* silencioso */ }
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
    if (c.solicitacao === "recusada") return false;
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

  return (
    <div className="msgs">
      {/* SIDEBAR */}
      <aside className="msgs__sidebar">
        <div className="msgs__sidebar-header">
          <h2>Mensagens</h2>
        </div>

        {/* Abas */}
        <div className="msgs__abas">
          <button
            className={`msgs__aba ${aba === "mensagens" ? "msgs__aba--ativa" : ""}`}
            onClick={() => setAba("mensagens")}
          >
            Mensagens
          </button>
          <button
            className={`msgs__aba ${aba === "solicitacoes" ? "msgs__aba--ativa" : ""}`}
            onClick={() => setAba("solicitacoes")}
          >
            Solicitações
            {totalSolicitacoes > 0 && (
              <span className="msgs__aba-badge">{totalSolicitacoes}</span>
            )}
          </button>
          <button
            className={`msgs__aba ${aba === "arquivadas" ? "msgs__aba--ativa" : ""}`}
            onClick={() => setAba("arquivadas")}
          >
            Arquivadas
          </button>
        </div>

        <div className="msgs__busca-wrap">
          <input
            type="text"
            placeholder="Buscar pessoa..."
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
              <p>{aba === "solicitacoes" ? "Nenhuma solicitação" : aba === "arquivadas" ? "Nenhuma conversa arquivada" : "Nenhuma conversa ainda"}</p>
              {aba === "mensagens" && <span>Busque alguém acima para começar</span>}
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
                      {c.ultimaMensagem.remetenteId === usuario?.id ? "Você: " : ""}
                      {c.ultimaMensagem.imagem && !c.ultimaMensagem.conteudo
                        ? "📷 Foto"
                        : c.ultimaMensagem.conteudo.length > 30
                          ? c.ultimaMensagem.conteudo.slice(0, 30) + "..."
                          : c.ultimaMensagem.conteudo}
                    </span>
                    <div className="msgs__conversa-badges">
                      {c.solicitacao === "enviada" && (
                        <span className="msgs__badge-pendente">Pendente</span>
                      )}
                      {c.naoLidas > 0 && <span className="msgs__badge">{c.naoLidas}</span>}
                    </div>
                  </div>
                </div>
              </button>
              {/* Menu de contexto */}
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
                        <ArchiveIcon size={13} /> Desarquivar
                      </button>
                    ) : (
                      <button onClick={() => arquivarConversa(c.usuario.id)}>
                        <ArchiveIcon size={13} /> Arquivar
                      </button>
                    )}
                    <button className="msgs__menu-deletar" onClick={() => deletarConversa(c.usuario.id)}>
                      <TrashIcon size={13} /> Deletar
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
            <p>Selecione uma conversa ou busque alguém para começar</p>
          </div>
        ) : (
          <>
            <div className="msgs__chat-header">
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
                <span className="msgs__pendente-tag">Aguardando resposta</span>
              )}
              {conversaArquivada && (
                <button className="msgs__desarquivar-btn" onClick={() => desarquivarConversa(conversaSelecionada.id)}>
                  Desarquivar
                </button>
              )}
            </div>

            {/* Banner de solicitação recebida */}
            {conversaEhSolicitacao && (
              <div className="msgs__solicitacao-banner">
                <p><strong>@{conversaSelecionada.username}</strong> quer te enviar uma mensagem.</p>
                <div className="msgs__solicitacao-acoes">
                  <button
                    className="msgs__sol-aceitar"
                    onClick={() => aceitarSolicitacao(conversaSelecionada.id)}
                    disabled={respondendo}
                  >
                    {respondendo ? "..." : "Aceitar"}
                  </button>
                  <button
                    className="msgs__sol-recusar"
                    onClick={() => recusarSolicitacao(conversaSelecionada.id)}
                    disabled={respondendo}
                  >
                    Recusar
                  </button>
                </div>
              </div>
            )}

            <div className="msgs__mensagens">
              {mensagens.length === 0 && (
                <div className="msgs__chat-vazio msgs__chat-vazio--inline">
                  <p>Comece a conversa!</p>
                </div>
              )}
              {mensagens.map(m => {
                const sou = m.remetenteId === usuario?.id;
                return (
                  <div
                    key={m.id}
                    className={`msgs__balao-wrap ${sou ? "msgs__balao-wrap--eu" : "msgs__balao-wrap--outro"}`}
                    onMouseLeave={() => { if (menuMensagem === m.id) setMenuMensagem(null); }}
                  >
                    {/* Botão de menu da mensagem */}
                    {!m.apagadaParaTodos && (
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
                            <button onClick={() => apagarParaMim(m.id)}>
                              Apagar para mim
                            </button>
                            {podePararTodos(m) && (
                              <button className="msgs__balao-drop-todos" onClick={() => apagarParaTodos(m.id)}>
                                Apagar para todos
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    <div className={`msgs__balao ${sou ? "msgs__balao--eu" : "msgs__balao--outro"} ${apagando === m.id ? "msgs__balao--apagando" : ""}`}>
                      {m.apagadaParaTodos ? (
                        <p className="msgs__balao-apagada">🚫 Mensagem apagada</p>
                      ) : (
                        <>
                          {m.imagem && (
                            <img
                              src={m.imagem}
                              alt="imagem"
                              className="msgs__balao-img"
                              onClick={() => window.open(m.imagem, "_blank")}
                            />
                          )}
                          {m.conteudo && <p>{m.conteudo}</p>}
                        </>
                      )}
                      <span className="msgs__balao-data">{formatarData(m.dataEnvio)}</span>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Preview de imagem */}
            {imagemPreview && (
              <div className="msgs__img-preview">
                <img src={imagemPreview} alt="preview" />
                <button className="msgs__img-preview-rm" onClick={removerImagemPreview}>
                  <XIcon size={14} />
                </button>
              </div>
            )}

            {/* Formulário desabilitado se solicitação recebida */}
            <form
              className={`msgs__form ${conversaEhSolicitacao ? "msgs__form--bloqueado" : ""}`}
              onSubmit={conversaEhSolicitacao ? e => e.preventDefault() : enviarMensagem}
            >
              {!conversaEhSolicitacao && (
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
                type="text"
                placeholder={conversaEhSolicitacao ? "Aceite a solicitação para responder" : "Digite uma mensagem..."}
                value={texto}
                onChange={e => setTexto(e.target.value)}
                className="msgs__input"
                disabled={enviando || conversaEhSolicitacao}
              />
              {!conversaEhSolicitacao && (
                <button
                  type="submit"
                  className="msgs__enviar"
                  disabled={(!texto.trim() && !imagemFile) || enviando}
                >
                  <SendIcon size={18} />
                </button>
              )}
            </form>
          </>
        )}
      </main>
    </div>
  );
}
