import { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { api } from "../api/api";
import { useAuth } from "../context/AuthContext";
import { useConfiguracoes } from "../hooks/useConfiguracoes";
import PostCard from "../components/PostCard";
import CreatePostModal from "../components/CreatePostModal";
import {
  HomeIcon, CompassIcon, FolderIcon, MessageIcon, BellIcon,
  PlusIcon, UserIcon, SettingsIcon, SearchIcon,
} from "../components/Icons";
import "../styles/components/Home.scss";

interface Post {
  id: number;
  titulo: string;
  descricao?: string;
  imagem?: string;
  curtidas: { id: number; usuarioId: number }[];
  comentarios: { id: number }[];
  autor: { id: number; nome: string; username: string; fotoPerfil?: string };
}

const CATEGORIAS = ["Metal", "Crochê", "Plumária", "Cerâmica", "Madeira", "Bordado", "Macramê"];

export default function Home() {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const config = useConfiguracoes();
  const { mostrarDescoberta, ordem } = config.feed;

  const [posts, setPosts] = useState<Post[]>([]);
  const [feedPosts, setFeedPosts] = useState<Post[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [categoria, setCategoria] = useState<string | null>(null);
  const [feedTab, setFeedTab] = useState<"explorar" | "feed">(
    usuario && !mostrarDescoberta ? "feed" : "explorar"
  );
  const [showModal, setShowModal] = useState(false);
  const [msgNaoLidas, setMsgNaoLidas] = useState(0);
  const [notifsNaoLidas, setNotifsNaoLidas] = useState(0);
  const [buscaSidebar, setBuscaSidebar] = useState("");
  const buscaRef = useRef<HTMLInputElement>(null);

  async function carregarPosts() {
    setCarregando(true);
    try {
      const res = await api.get("/post");
      setPosts(Array.isArray(res.data) ? res.data : []);
    } catch {
      setPosts([]);
    } finally {
      setCarregando(false);
    }
  }

  async function carregarFeed() {
    if (!usuario) return;
    try {
      const res = await api.get(`/post/feed/${usuario.id}`);
      setFeedPosts(Array.isArray(res.data) ? res.data : []);
    } catch { setFeedPosts([]); }
  }

  async function carregarBadges() {
    if (!usuario) return;
    try {
      const [msgs, notifs] = await Promise.all([
        api.get(`/mensagem/nao-lidas/${usuario.id}`).catch(() => ({ data: { count: 0 } })),
        api.get(`/notificacao/nao-lidas/${usuario.id}`).catch(() => ({ data: { data: { total: 0 } } })),
      ]);
      setMsgNaoLidas(msgs.data?.count ?? 0);
      const n = notifs.data?.data ?? notifs.data;
      setNotifsNaoLidas(n?.total ?? 0);
    } catch { /* silencioso */ }
  }

  useEffect(() => {
    carregarPosts();
    if (usuario) { carregarFeed(); carregarBadges(); }
  }, [usuario?.id]);

  const listaAtiva = feedTab === "feed" ? feedPosts : posts;

  const filtrados = useMemo(() => {
    let lista = categoria
      ? listaAtiva.filter(p =>
          p.titulo.toLowerCase().includes(categoria.toLowerCase()) ||
          (p.descricao ?? "").toLowerCase().includes(categoria.toLowerCase())
        )
      : listaAtiva;
    if (ordem === "engajamento") {
      lista = [...lista].sort((a, b) => b.curtidas.length - a.curtidas.length);
    }
    return lista;
  }, [listaAtiva, categoria, ordem]);

  function buscar(e: React.FormEvent) {
    e.preventDefault();
    if (buscaSidebar.trim()) {
      navigate(`/busca?q=${encodeURIComponent(buscaSidebar.trim())}`);
      setBuscaSidebar("");
    }
  }

  const inicial = usuario?.nome?.charAt(0).toUpperCase() ?? "?";

  const navItems = [
    { label: "Início",          Icon: HomeIcon,    path: "/",             exact: true },
    { label: "Explorar",        Icon: CompassIcon, path: "/busca",        exact: false },
    { label: "Catálogos",       Icon: FolderIcon,  path: "/catalogos",    exact: false },
    { label: "Mensagens",       Icon: MessageIcon, path: "/mensagens",    exact: false, badge: msgNaoLidas },
    { label: "Notificações",    Icon: BellIcon,    path: "/notificacoes", exact: false, badge: notifsNaoLidas },
    { label: "Perfil",          Icon: UserIcon,    path: "/perfil",       exact: false },
    { label: "Configurações",   Icon: SettingsIcon,path: "/configuracoes",exact: false },
  ];

  function isActive(path: string, exact: boolean) {
    if (path.startsWith("#")) return false;
    return exact ? location.pathname === path : location.pathname === path;
  }

  return (
    <div className="home">

      {/* ── SIDEBAR ESQUERDA ──────────────────────────────── */}
      <aside className="home__sidebar">
        {/* Busca inline */}
        <form className="home__sidebar-busca" onSubmit={buscar}>
          <SearchIcon size={15} />
          <input
            ref={buscaRef}
            type="text"
            placeholder="Pesquisar..."
            value={buscaSidebar}
            onChange={e => setBuscaSidebar(e.target.value)}
          />
        </form>

        {/* Nav */}
        <nav className="home__sidebar-nav">
          {navItems.map(({ label, Icon, path, exact, badge }) => (
            <Link
              key={label}
              to={path}
              className={`home__nav-item ${isActive(path, exact) ? "home__nav-item--ativo" : ""}`}
            >
              <span className="home__nav-icon-wrap">
                <Icon size={22} />
                {badge ? <span className="home__nav-badge">{badge > 9 ? "9+" : badge}</span> : null}
              </span>
              <span className="home__nav-label">{label}</span>
            </Link>
          ))}
        </nav>

        {/* Botão nova publicação */}
        {usuario && (
          <button className="home__sidebar-novo" onClick={() => setShowModal(true)}>
            <PlusIcon size={16} />
            Nova publicação
          </button>
        )}

        {/* Avatar do usuário */}
        {usuario && (
          <div className="home__sidebar-user" onClick={() => navigate("/perfil")}>
            <div className="home__sidebar-avatar">
              {usuario.fotoPerfil
                ? <img src={usuario.fotoPerfil} alt={usuario.nome} />
                : <span>{inicial}</span>}
            </div>
            <div className="home__sidebar-user-info">
              <span className="home__sidebar-user-nome">{usuario.nome}</span>
              <span className="home__sidebar-user-user">@{usuario.username}</span>
            </div>
          </div>
        )}
      </aside>

      {/* ── FEED PRINCIPAL ────────────────────────────────── */}
      <main className="home__main">

        {/* Tabs */}
        {usuario && (mostrarDescoberta || feedTab === "feed") && (
          <div className="home__tabs">
            {mostrarDescoberta && (
              <button
                className={feedTab === "explorar" ? "active" : ""}
                onClick={() => setFeedTab("explorar")}
              >
                Explorar
              </button>
            )}
            <button
              className={feedTab === "feed" ? "active" : ""}
              onClick={() => setFeedTab("feed")}
            >
              Para você
            </button>
          </div>
        )}

        {/* Filtros */}
        <div className="home__filters">
          <button
            className={`home__pill ${!categoria ? "home__pill--ativo" : ""}`}
            onClick={() => setCategoria(null)}
          >
            Tudo
          </button>
          {CATEGORIAS.map(cat => (
            <button
              key={cat}
              className={`home__pill ${categoria === cat ? "home__pill--ativo" : ""}`}
              onClick={() => setCategoria(categoria === cat ? null : cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="home__body">
          {carregando ? (
            <div className="home__skeleton-grid">
              {Array.from({ length: 6 }).map((_, i) => <div key={i} className="home__skeleton" />)}
            </div>
          ) : feedTab === "feed" && feedPosts.length === 0 ? (
            <div className="home__empty">
              <p>Nenhuma publicação dos seus seguidos ainda.</p>
              <button className="home__explorar-btn" onClick={() => setFeedTab("explorar")}>
                Explorar tudo
              </button>
            </div>
          ) : filtrados.length === 0 ? (
            <div className="home__empty">
              <p>Nenhuma publicação encontrada.</p>
            </div>
          ) : (
            <div className="home__grid">
              {filtrados.map(post => (
                <PostCard
                  key={post.id}
                  id={post.id}
                  titulo={post.titulo}
                  descricao={post.descricao}
                  imagem={post.imagem}
                  curtidas={post.curtidas}
                  autor={post.autor}
                  onCurtidaChange={() => { carregarPosts(); if (usuario) carregarFeed(); }}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {showModal && (
        <CreatePostModal
          onClose={() => setShowModal(false)}
          onSuccess={() => { setShowModal(false); carregarPosts(); if (usuario) carregarFeed(); }}
        />
      )}
    </div>
  );
}
