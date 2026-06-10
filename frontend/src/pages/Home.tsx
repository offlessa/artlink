import { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { api } from "../api/api";
import { useAuth } from "../context/AuthContext";
import { useConfiguracoes } from "../hooks/useConfiguracoes";
import { useI18n } from "../hooks/useI18n";
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
  imagens?: string[];
  tags?: string[];
  visualizacoes?: number;
  curtidas: { id: number; usuarioId: number }[];
  comentarios: { id: number }[];
  autor: { id: number; nome: string; username: string; fotoPerfil?: string };
}

export default function Home() {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const config = useConfiguracoes();
  const t = useI18n();
  const { mostrarDescoberta, ordem } = config.feed;

  const [posts, setPosts] = useState<Post[]>([]);
  const [feedPosts, setFeedPosts] = useState<Post[]>([]);
  const [carregando, setCarregando] = useState(true);

  interface Artista { id: number; nome: string; username: string; fotoPerfil?: string; seguidores: number }
  const [sugestoes, setSugestoes] = useState<Artista[]>([]);
  const [seguindoSugestoes, setSeguindoSugestoes] = useState<Set<number>>(new Set());
  const [loadingSeguir, setLoadingSeguir] = useState<number | null>(null);
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

  async function carregarSugestoes() {
    if (!usuario) return;
    try {
      const res = await api.get("/usuario/artistas");
      const artistas: Artista[] = (Array.isArray(res.data) ? res.data : [])
        .filter((a: Artista) => a.id !== usuario.id)
        .slice(0, 6);
      setSugestoes(artistas);
      if (artistas.length > 0) {
        const checks = await Promise.allSettled(
          artistas.map(a => api.get(`/seguidor/checar/${usuario.id}/${a.id}`))
        );
        const ids = new Set<number>();
        checks.forEach((r, i) => {
          const seg = r.status === "fulfilled"
            ? (r.value.data?.data?.seguindo ?? r.value.data?.seguindo ?? false)
            : false;
          if (seg) ids.add(artistas[i].id);
        });
        setSeguindoSugestoes(ids);
      }
    } catch { setSugestoes([]); }
  }

  async function toggleSeguirSugestao(artistaId: number) {
    if (!usuario || loadingSeguir) return;
    setLoadingSeguir(artistaId);
    try {
      if (seguindoSugestoes.has(artistaId)) {
        await api.delete(`/seguidor/${usuario.id}/${artistaId}`);
        setSeguindoSugestoes(prev => { const s = new Set(prev); s.delete(artistaId); return s; });
      } else {
        await api.post("/seguidor", { seguidorId: usuario.id, seguidoId: artistaId });
        setSeguindoSugestoes(prev => new Set(prev).add(artistaId));
        carregarFeed();
      }
    } catch { /* silencioso */ }
    finally { setLoadingSeguir(null); }
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
    if (usuario) { carregarFeed(); carregarBadges(); carregarSugestoes(); }
  }, [usuario?.id]);

  const listaAtiva = feedTab === "feed" ? feedPosts : posts;

  const todasTags = useMemo(() => {
    const set = new Set<string>();
    posts.forEach(p => p.tags?.forEach(t => set.add(t)));
    return Array.from(set).slice(0, 20);
  }, [posts]);

  const filtrados = useMemo(() => {
    let lista = categoria
      ? listaAtiva.filter(p => p.tags?.includes(categoria))
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
    { label: t.home.nav.home,          Icon: HomeIcon,    path: "/",             exact: true },
    { label: t.home.nav.explore,       Icon: CompassIcon, path: "/busca",        exact: false },
    { label: t.home.nav.catalogs,      Icon: FolderIcon,  path: "/catalogos",    exact: false },
    { label: t.home.nav.messages,      Icon: MessageIcon, path: "/mensagens",    exact: false, badge: msgNaoLidas },
    { label: t.home.nav.notifications, Icon: BellIcon,    path: "/notificacoes", exact: false, badge: notifsNaoLidas },
    { label: t.home.nav.profile,       Icon: UserIcon,    path: "/perfil",       exact: false },
    { label: t.home.nav.settings,      Icon: SettingsIcon,path: "/configuracoes",exact: false },
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
            placeholder={t.nav.search}
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
            {t.home.newPost}
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
                {t.home.explore}
              </button>
            )}
            <button
              className={feedTab === "feed" ? "active" : ""}
              onClick={() => setFeedTab("feed")}
            >
              {t.home.forYou}
            </button>
          </div>
        )}

        {/* Filtros */}
        <div className="home__filters">
          <button
            className={`home__pill ${!categoria ? "home__pill--ativo" : ""}`}
            onClick={() => setCategoria(null)}
          >
            {t.home.all}
          </button>
          {todasTags.map(tag => (
            <button
              key={tag}
              className={`home__pill ${categoria === tag ? "home__pill--ativo" : ""}`}
              onClick={() => setCategoria(categoria === tag ? null : tag)}
            >
              #{tag}
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
            <div className="home__sugestoes">
              <h2 className="home__sugestoes-titulo">{t.home.suggestTitle}</h2>
              <p className="home__sugestoes-hint">{t.home.suggestHint}</p>
              {sugestoes.length > 0 && (
                <div className="home__sugestoes-grid">
                  {sugestoes.map(artista => {
                    const seguindo = seguindoSugestoes.has(artista.id);
                    const inicial = artista.nome.charAt(0).toUpperCase();
                    return (
                      <div key={artista.id} className="home__sugestao-card">
                        <div
                          className="home__sugestao-avatar"
                          onClick={() => navigate(`/u/${artista.username}`)}
                          style={{ cursor: "pointer" }}
                        >
                          {artista.fotoPerfil
                            ? <img src={artista.fotoPerfil} alt={artista.nome} />
                            : <span>{inicial}</span>}
                        </div>
                        <div className="home__sugestao-info">
                          <span
                            className="home__sugestao-nome"
                            onClick={() => navigate(`/u/${artista.username}`)}
                          >
                            {artista.nome}
                          </span>
                          <span className="home__sugestao-user">@{artista.username}</span>
                        </div>
                        <button
                          className={`home__sugestao-btn ${seguindo ? "home__sugestao-btn--ativo" : ""}`}
                          onClick={() => toggleSeguirSugestao(artista.id)}
                          disabled={loadingSeguir === artista.id}
                        >
                          {loadingSeguir === artista.id ? "..." : seguindo ? "Seguindo" : "Seguir"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
              <button className="home__explorar-btn" onClick={() => setFeedTab("explorar")}>
                {t.home.exploreAll}
              </button>
            </div>
          ) : filtrados.length === 0 ? (
            <div className="home__empty">
              <p>{t.home.emptyResult}</p>
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
                  imagens={post.imagens}
                  tags={post.tags}
                  visualizacoes={post.visualizacoes}
                  curtidas={post.curtidas}
                  autor={post.autor}
                  onCurtidaChange={() => { carregarPosts(); if (usuario) carregarFeed(); }}
                  onDelete={() => { carregarPosts(); if (usuario) carregarFeed(); }}
                  onEdit={() => { carregarPosts(); if (usuario) carregarFeed(); }}
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
