import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { SearchIcon, UserIcon, LogOutIcon, PlusIcon, BellIcon, MessageIcon } from "./Icons";
import CreatePostModal from "./CreatePostModal";
import { api } from "../api/api";
import "../styles/components/Navbar.scss";

interface Notificacao {
  id: number;
  tipo: "curtida" | "comentario" | "seguindo" | "colaboracao";
  lida: boolean;
  data: string;
  postId?: number;
  remetente: { id: number; nome: string; username: string; fotoPerfil?: string };
  post?: { id: number; titulo: string };
}

export default function Navbar() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [busca, setBusca] = useState("");
  const [menuAberto, setMenuAberto] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [showNotif, setShowNotif] = useState(false);
  const [respondendo, setRespondendo] = useState<number | null>(null);
  const [msgNaoLidas, setMsgNaoLidas] = useState(0);
  const notifRef = useRef<HTMLDivElement>(null);

  const naoLidas = notificacoes.filter(n => !n.lida).length;

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

  // Zera o badge de mensagens ao entrar na página de mensagens
  useEffect(() => {
    if (location.pathname === "/mensagens") setMsgNaoLidas(0);
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

  async function carregarNotificacoes() {
    if (!usuario) return;
    try {
      const res = await api.get(`/notificacao/${usuario.id}`);
      const dados = res.data?.data ?? res.data ?? [];
      setNotificacoes(Array.isArray(dados) ? dados : []);
    } catch { /* silencioso */ }
  }

  async function carregarMsgNaoLidas() {
    if (!usuario) return;
    try {
      const res = await api.get(`/mensagem/nao-lidas/${usuario.id}`);
      const count = res.data?.count ?? 0;
      // Não mostra badge se o usuário já está na página de mensagens
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
    if (!n.post) return;
    setRespondendo(n.id);
    try {
      const acao = aceitar ? "aceitar" : "recusar";
      await api.patch(`/post/colaboracao/${n.post.id}/${acao}`);
      await carregarNotificacoes();
    } catch { /* silencioso */ }
    finally { setRespondendo(null); }
  }

  function handleBusca(e: React.FormEvent) {
    e.preventDefault();
    if (busca.trim()) {
      navigate(`/busca?q=${encodeURIComponent(busca.trim())}`);
      setBusca("");
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
        <Link to="/">Arte</Link>
        <Link to="/artistas">Artistas</Link>
        <Link to="/sobre">Sobre nós</Link>
      </div>

      {usuario && (
        <>
          <button className="navbar__criar" onClick={() => setShowModal(true)} title="Nova publicação">
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
                {notificacoes.length === 0 ? (
                  <p className="navbar__notif-empty">Nenhuma notificação ainda.</p>
                ) : (
                  notificacoes.slice(0, 20).map(n => (
                    <div
                      key={n.id}
                      className={`navbar__notif-item ${!n.lida ? "navbar__notif-item--nova" : ""} ${n.tipo === "colaboracao" ? "navbar__notif-item--colab" : ""}`}
                      onClick={() => {
                        if (n.tipo === "colaboracao") return;
                        setShowNotif(false);
                        if (n.post) navigate(`/post/${n.post.id}`);
                        else navigate(`/u/${n.remetente.username}`);
                      }}
                      style={{ cursor: n.tipo === "colaboracao" ? "default" : "pointer" }}
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
          <span className="navbar__username">{usuario.username}</span>

          {menuAberto && (
            <div className="navbar__dropdown">
              <Link to="/perfil" onClick={() => setMenuAberto(false)}>
                <UserIcon size={14} /> Meu Perfil
              </Link>
              <button onClick={handleLogout}>
                <LogOutIcon size={14} /> Sair
              </button>
            </div>
          )}
        </div>
      ) : (
        <Link to="/login" className="navbar__entrar">Entrar</Link>
      )}
    </nav>
  );
}
