import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { SearchIcon, UserIcon, LogOutIcon, PlusIcon, BellIcon, MessageIcon, SettingsIcon, VerificadoIcon, MenuIcon, XIcon } from "./Icons";
import { isVerificado } from "../utils/verificado";
import CreatePostModal from "./CreatePostModal";
import { api } from "../api/api";
import "../styles/components/Navbar.scss";

type TipoNotif = "curtida" | "comentario" | "seguindo" | "colaboracao" | "colaboracao_catalogo" | "mensagem";

interface Notificacao {
  id: number;
  tipo: TipoNotif;
  lida: boolean;
  data: string;
  postId?: number;
  catalogoId?: number;
  remetente: { id: number; nome: string; username: string; fotoPerfil?: string };
  post?: { id: number; titulo: string };
  catalogo?: { id: number; nome: string };
}

interface ConfigNotif {
  ativas: boolean;
  curtida: boolean;
  comentario: boolean;
  seguindo: boolean;
  colaboracao: boolean;
  colaboracao_catalogo: boolean;
  mensagem: boolean;
  som: boolean;
}

const DEFAULT_CONFIG: ConfigNotif = {
  ativas: true, curtida: true, comentario: true, seguindo: true,
  colaboracao: true, colaboracao_catalogo: true, mensagem: true, som: true,
};

function parseConfigNotif(raw?: string): ConfigNotif {
  if (!raw) return DEFAULT_CONFIG;
  try {
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_CONFIG, ...(parsed.notificacoes ?? {}) };
  } catch { return DEFAULT_CONFIG; }
}

function tocarSom() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 0.12);
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.35);
  } catch { /* silencioso */ }
}

export default function Navbar() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [busca, setBusca] = useState("");
  const [menuAberto, setMenuAberto] = useState(false);
  const [menuMobileAberto, setMenuMobileAberto] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [showNotif, setShowNotif] = useState(false);
  const [respondendo, setRespondendo] = useState<number | null>(null);
  const [msgNaoLidas, setMsgNaoLidas] = useState(0);
  const notifRef = useRef<HTMLDivElement>(null);

  const configNotif = parseConfigNotif(usuario?.configuracoes);

  const notificacoesFiltradas = configNotif.ativas
    ? notificacoes.filter(n => configNotif[n.tipo as keyof ConfigNotif] !== false)
    : [];

  const naoLidas = notificacoesFiltradas.filter(n => !n.lida).length;

  useEffect(() => {
    if (!usuario) return;
    carregarNotificacoes();
    carregarMsgNaoLidas();
    const interval = setInterval(() => {
      carregarNotificacoes();
      carregarMsgNaoLidas();
    }, 30000);
    return () => clearInterval(interval);
  }, [usuario?.id]);

  useEffect(() => {
    if (location.pathname === "/mensagens") setMsgNaoLidas(0);
    setMenuMobileAberto(false);
    setMenuAberto(false);
    setShowNotif(false);
  }, [location.pathname]);

  useEffect(() => {
    function fechar(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotif(false);
      }
    }
    document.addEventListener("mousedown", fechar);
    return () => document.removeEventListener("mousedown", fechar);
  }, []);

  useEffect(() => {
    if (menuMobileAberto) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [menuMobileAberto]);

  async function carregarNotificacoes() {
    if (!usuario) return;
    try {
      const res = await api.get(`/notificacao/${usuario.id}`);
      const dados: Notificacao[] = Array.isArray(res.data?.data ?? res.data) ? (res.data?.data ?? res.data) : [];
      const cfg = parseConfigNotif(usuario.configuracoes);
      const anteriores = notificacoes.filter(n => !n.lida).length;
      const novas = dados.filter(n => !n.lida && cfg.ativas && cfg[n.tipo as keyof ConfigNotif] !== false);
      if (novas.length > anteriores && cfg.som) tocarSom();
      setNotificacoes(dados);
    } catch { /* silencioso */ }
  }

  async function carregarMsgNaoLidas() {
    if (!usuario) return;
    try {
      const res = await api.get(`/mensagem/nao-lidas/${usuario.id}`);
      const count = res.data?.count ?? 0;
      if (location.pathname !== "/mensagens") setMsgNaoLidas(count);
    } catch { /* silencioso */ }
  }

  async function abrirNotificacoes() {
    setShowNotif(v => !v);
    setMenuAberto(false);
    if (!showNotif && naoLidas > 0 && usuario) {
      try {
        await api.put(`/notificacao/marcar-lidas/${usuario.id}`);
        setNotificacoes(prev => prev.map(n => ({ ...n, lida: true })));
      } catch { /* silencioso */ }
    }
  }

  async function responderColaboracao(n: Notificacao, aceitar: boolean) {
    setRespondendo(n.id);
    try {
      const acao = aceitar ? "aceitar" : "recusar";
      if (n.tipo === "colaboracao_catalogo" && n.catalogoId) {
        await api.patch(`/catalogo/colaboracao/${n.catalogoId}/${acao}`);
      } else if (n.post) {
        await api.patch(`/post/colaboracao/${n.post.id}/${acao}`);
      }
      await carregarNotificacoes();
    } catch { /* silencioso */ }
    finally { setRespondendo(null); }
  }

  function handleBusca(e: React.FormEvent) {
    e.preventDefault();
    if (busca.trim()) {
      navigate(`/busca?q=${encodeURIComponent(busca.trim())}`);
      setBusca("");
      setMenuMobileAberto(false);
    }
  }

  function handleLogout() {
    logout();
    navigate("/login");
  }

  function textoNotificacao(n: Notificacao) {
    switch (n.tipo) {
      case "curtida": return `curtiu seu post "${n.post?.titulo ?? ""}"`;
      case "comentario": return `comentou no seu post "${n.post?.titulo ?? ""}"`;
      case "seguindo": return "começou a te seguir";
      case "colaboracao": return `te convidou para colaborar em "${n.post?.titulo ?? ""}"`;
      case "colaboracao_catalogo": return `te convidou para colaborar no catálogo "${n.catalogo?.nome ?? ""}"`;
      case "mensagem": return "te enviou uma mensagem";
    }
  }

  function formatarData(iso: string) {
    const d = new Date(iso);
    const agora = new Date();
    const diff = Math.floor((agora.getTime() - d.getTime()) / 1000);
    if (diff < 60) return "agora";
    if (diff < 3600) return `${Math.floor(diff / 60)}min`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / 86400)}d`;
  }

  const inicial = usuario?.nome?.charAt(0).toUpperCase() ?? "?";

  return (
    <>
      <nav className="navbar">
        <Link to="/" className="navbar__logo">ARTLINK</Link>

        <form className="navbar__search" onSubmit={handleBusca}>
          <SearchIcon size={15} className="navbar__search-icon" />
          <input
            type="text"
            placeholder="Pesquisar..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
          {busca && (
            <button type="button" className="navbar__search-clear" onClick={() => setBusca("")}>
              &times;
            </button>
          )}
        </form>

        <div className="navbar__links">
          <Link to="/arte">Arte</Link>
          <Link to="/artistas">Artistas</Link>
          <Link to="/sobre">Sobre nós</Link>
        </div>

        {usuario && (
          <>
            <button className="navbar__criar navbar__criar--desktop" onClick={() => setShowModal(true)} title="Nova publicação">
              <PlusIcon size={16} />
            </button>

            <Link to="/mensagens" className="navbar__icon-btn" title="Mensagens">
              <MessageIcon size={18} />
              {msgNaoLidas > 0 && (
                <span className="navbar__badge">{msgNaoLidas > 9 ? "9+" : msgNaoLidas}</span>
              )}
            </Link>

            <div className="navbar__notif-wrap" ref={notifRef}>
              <button
                className={`navbar__icon-btn ${naoLidas > 0 ? "navbar__icon-btn--ativo" : ""}`}
                onClick={abrirNotificacoes}
                title="Notificações"
              >
                <BellIcon size={18} />
                {naoLidas > 0 && <span className="navbar__badge">{naoLidas > 9 ? "9+" : naoLidas}</span>}
              </button>

              {showNotif && (
                <div className="navbar__notif-dropdown">
                  <div className="navbar__notif-header">
                    <span>Notificações</span>
                  </div>
                  {notificacoesFiltradas.length === 0 ? (
                    <p className="navbar__notif-empty">Nenhuma notificação ainda.</p>
                  ) : (
                    notificacoesFiltradas.slice(0, 20).map(n => (
                      <div
                        key={n.id}
                        className={`navbar__notif-item ${!n.lida ? "navbar__notif-item--nova" : ""} ${n.tipo === "colaboracao" ? "navbar__notif-item--colab" : ""}`}
                        onClick={() => {
                          if (n.tipo === "colaboracao" || n.tipo === "colaboracao_catalogo") return;
                          setShowNotif(false);
                          if (n.tipo === "mensagem") navigate("/mensagens");
                          else if (n.post) navigate(`/post/${n.post.id}`);
                          else navigate(`/u/${n.remetente.username}`);
                        }}
                        style={{ cursor: (n.tipo === "colaboracao" || n.tipo === "colaboracao_catalogo") ? "default" : "pointer" }}
                      >
                        <div className="navbar__notif-avatar">
                          {n.remetente.fotoPerfil
                            ? <img src={n.remetente.fotoPerfil} alt={n.remetente.nome} />
                            : <span>{n.remetente.nome.charAt(0).toUpperCase()}</span>}
                        </div>
                        <div className="navbar__notif-texto">
                          <div>
                            <strong>{n.remetente.nome}</strong> {textoNotificacao(n)}
                            <span className="navbar__notif-data"> · {formatarData(n.data)}</span>
                          </div>
                          {n.tipo === "colaboracao" && (
                            <div className="navbar__notif-colab-acoes">
                              <button
                                className="navbar__notif-aceitar"
                                disabled={respondendo === n.id}
                                onClick={e => { e.stopPropagation(); responderColaboracao(n, true); }}
                              >
                                {respondendo === n.id ? "..." : "Aceitar"}
                              </button>
                              <button
                                className="navbar__notif-recusar"
                                disabled={respondendo === n.id}
                                onClick={e => { e.stopPropagation(); responderColaboracao(n, false); }}
                              >
                                Recusar
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {showModal && (
          <CreatePostModal
            onClose={() => setShowModal(false)}
            onSuccess={() => { setShowModal(false); navigate("/perfil"); }}
          />
        )}

        {usuario ? (
          <div className="navbar__user" onClick={() => { setMenuAberto(!menuAberto); setShowNotif(false); }}>
            <div className="navbar__avatar">
              {usuario.fotoPerfil
                ? <img src={usuario.fotoPerfil} alt={usuario.nome} />
                : <span>{inicial}</span>
              }
            </div>
            <span className="navbar__username">
              {usuario.username}
            </span>
            {isVerificado(usuario.username) && <VerificadoIcon size={12} style={{ marginLeft: 2, verticalAlign: "middle", flexShrink: 0 }} />}

            {menuAberto && (
              <div className="navbar__dropdown">
                <Link to="/perfil" onClick={() => setMenuAberto(false)}>
                  <UserIcon size={14} /> Meu Perfil
                </Link>
                <Link to="/configuracoes" onClick={() => setMenuAberto(false)}>
                  <SettingsIcon size={14} /> Configurações
                </Link>
                <button onClick={handleLogout}>
                  <LogOutIcon size={14} /> Sair
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link to="/login" className="navbar__entrar navbar__entrar--desktop">Entrar</Link>
        )}

        <button
          className="navbar__hamburger"
          onClick={() => setMenuMobileAberto(v => !v)}
          aria-label="Menu"
        >
          {menuMobileAberto ? <XIcon size={20} /> : <MenuIcon size={20} />}
        </button>
      </nav>

      {menuMobileAberto && (
        <div className="navbar__mobile-overlay" onClick={() => setMenuMobileAberto(false)}>
          <div className="navbar__mobile-menu" onClick={e => e.stopPropagation()}>
            <form className="navbar__mobile-search" onSubmit={handleBusca}>
              <SearchIcon size={15} className="navbar__search-icon" />
              <input
                type="text"
                placeholder="Pesquisar..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                autoFocus
              />
              {busca && (
                <button type="button" className="navbar__search-clear" onClick={() => setBusca("")}>
                  &times;
                </button>
              )}
            </form>

            <nav className="navbar__mobile-links">
              <Link to="/arte">Arte</Link>
              <Link to="/artistas">Artistas</Link>
              <Link to="/sobre">Sobre nós</Link>
            </nav>

            {usuario ? (
              <>
                <button className="navbar__mobile-criar" onClick={() => { setShowModal(true); setMenuMobileAberto(false); }}>
                  <PlusIcon size={16} /> Nova publicação
                </button>
                <div className="navbar__mobile-divider" />
                <Link to="/perfil" className="navbar__mobile-user-link">
                  <div className="navbar__avatar">
                    {usuario.fotoPerfil
                      ? <img src={usuario.fotoPerfil} alt={usuario.nome} />
                      : <span>{inicial}</span>
                    }
                  </div>
                  <div>
                    <div className="navbar__mobile-nome">
                      {usuario.nome}
                      {isVerificado(usuario.username) && <VerificadoIcon size={14} style={{ marginLeft: 5, verticalAlign: "middle" }} />}
                    </div>
                    <div className="navbar__mobile-username">@{usuario.username}</div>
                  </div>
                </Link>
                <Link to="/configuracoes" className="navbar__mobile-item">
                  <SettingsIcon size={16} /> Configurações
                </Link>
                <button className="navbar__mobile-item navbar__mobile-item--sair" onClick={handleLogout}>
                  <LogOutIcon size={16} /> Sair
                </button>
              </>
            ) : (
              <div className="navbar__mobile-auth">
                <Link to="/login" className="navbar__mobile-entrar">Entrar</Link>
                <Link to="/cadastro" className="navbar__mobile-cadastrar">Criar conta</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
