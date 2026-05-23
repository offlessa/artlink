import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api/api";
import { useAuth } from "../context/AuthContext";
import Footer from "../components/Footer";
import { HeartIcon, CommentIcon, FolderIcon, ImageOffIcon } from "../components/Icons";
import "../styles/components/PerfilPublico.scss";

interface Post { id: number; titulo: string; imagem?: string; curtidas: { id: number; usuarioId: number }[]; comentarios: { id: number }[] }
interface Catalogo { id: number; nome: string; posts: { postId: number }[] }
interface PerfilData { id: number; nome: string; username: string; bio?: string; cidade?: string; fotoPerfil?: string; fotoCapa?: string; perfilConfig?: string }

interface ProfileConfig {
  bgType: string; bgValue: string; cardStyle: string; layout: string;
}
const DEFAULT_CONFIG: ProfileConfig = { bgType: "solid", bgValue: "#FAF8F3", cardStyle: "rounded", layout: "grid" };

function parseConfig(raw?: string): ProfileConfig {
  if (!raw) return DEFAULT_CONFIG;
  try { return { ...DEFAULT_CONFIG, ...JSON.parse(raw) }; } catch { return DEFAULT_CONFIG; }
}

export default function PerfilPublico() {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { usuario: eu } = useAuth();

  const [perfil, setPerfil] = useState<PerfilData | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [catalogos, setCatalogos] = useState<Catalogo[]>([]);
  const [tab, setTab] = useState<"posts" | "catalogos">("posts");
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!username) return;
    setLoading(true);
    api.get(`/usuario/username/${username}`)
      .then(async res => {
        const u: PerfilData = res.data;
        setPerfil(u);
        if (eu && eu.username === username) { navigate("/perfil", { replace: true }); return; }
        const [rp, rc] = await Promise.all([
          api.get(`/post/usuario/${u.id}`).catch(() => ({ data: [] })),
          api.get(`/catalogo/usuario/${u.id}`).catch(() => ({ data: [] })),
        ]);
        setPosts(Array.isArray(rp.data) ? rp.data : []);
        setCatalogos(Array.isArray(rc.data) ? rc.data : []);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [username, eu?.username]);

  const config = useMemo(() => parseConfig(perfil?.perfilConfig), [perfil?.perfilConfig]);

  const bgStyle = useMemo(() => {
    if (config.bgType === "gradient") return { background: config.bgValue };
    return { backgroundColor: config.bgValue || "#FAF8F3" };
  }, [config]);

  if (loading) return <div className="pp-loading">Carregando...</div>;
  if (notFound || !perfil) return <div className="pp-loading">Perfil não encontrado.</div>;

  const inicial = perfil.nome.charAt(0).toUpperCase();

  return (
    <div className={`pp ${config.bgType === "texture" ? `pp--texture-${config.bgValue}` : ""}`} style={bgStyle}>
      {/* BANNER */}
      <div className="pp__banner">
        {perfil.fotoCapa
          ? <img src={perfil.fotoCapa} alt="capa" />
          : <div className="pp__banner-placeholder" />}
      </div>

      {/* PROFILE CARD */}
      <div className="pp__card">
        <div className="pp__avatar">
          {perfil.fotoPerfil ? <img src={perfil.fotoPerfil} alt={perfil.nome} /> : <span>{inicial}</span>}
        </div>
        <div className="pp__meta">
          <h1 className="pp__nome">{perfil.nome}</h1>
          <span className="pp__username">@{perfil.username}</span>
          {perfil.bio && <p className="pp__bio">{perfil.bio}</p>}
          {perfil.cidade && <p className="pp__cidade">📍 {perfil.cidade}</p>}
          <div className="pp__stats">
            <span><strong>{posts.length}</strong> posts</span>
            <span><strong>{catalogos.length}</strong> catálogos</span>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="pp__tabs">
        <button className={tab === "posts" ? "active" : ""} onClick={() => setTab("posts")}>
          Posts <span className="pp__tab-count">{posts.length}</span>
        </button>
        <button className={tab === "catalogos" ? "active" : ""} onClick={() => setTab("catalogos")}>
          Catálogos <span className="pp__tab-count">{catalogos.length}</span>
        </button>
      </div>

      {/* CONTENT */}
      {tab === "posts" && (
        <div className={`pp__galeria pp__galeria--${config.layout} pp__galeria--${config.cardStyle}`}>
          {posts.length === 0
            ? <p className="pp__empty">Nenhuma publicação ainda.</p>
            : posts.map(post => (
              <div key={post.id} className="pp__post-card" onClick={() => navigate(`/post/${post.id}`)}>
                <div className="pp__post-img">
                  {post.imagem ? <img src={post.imagem} alt={post.titulo} /> : <div className="pp__post-no-img"><ImageOffIcon size={28} /></div>}
                </div>
                <div className="pp__post-info">
                  <span className="pp__post-titulo">{post.titulo}</span>
                  <div className="pp__post-stats">
                    <span><HeartIcon size={11} /> {post.curtidas.length}</span>
                    <span><CommentIcon size={11} /> {post.comentarios.length}</span>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}

      {tab === "catalogos" && (
        <div className="pp__cat-grid">
          {catalogos.length === 0
            ? <p className="pp__empty">Nenhum catálogo ainda.</p>
            : catalogos.map(cat => (
              <div key={cat.id} className="pp__cat-card">
                <div className="pp__cat-icon"><FolderIcon size={28} /></div>
                <p className="pp__cat-nome">{cat.nome}</p>
                <span className="pp__cat-count">{cat.posts.length} item{cat.posts.length !== 1 ? "s" : ""}</span>
              </div>
            ))}
        </div>
      )}

      <Footer />
    </div>
  );
}
