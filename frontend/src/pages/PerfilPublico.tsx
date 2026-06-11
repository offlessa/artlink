import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api/api";
import { useAuth } from "../context/AuthContext";
import { useI18n } from "../hooks/useI18n";
import Footer from "../components/Footer";
import { HeartIcon, CommentIcon, ImageOffIcon, UsersIcon, MessageIcon, ShareIcon, VerificadoIcon } from "../components/Icons";
import SeguidoresModal from "../components/SeguidoresModal";
import FotoLightbox from "../components/FotoLightbox";
import Toast from "../components/Toast";
import ShareModal from "../components/ShareModal";
import { isVerificado } from "../utils/verificado";
import "../styles/components/PerfilPublico.scss";

interface Post { id: number; titulo: string; imagem?: string; curtidas: { id: number; usuarioId: number }[]; comentarios: { id: number }[]; autor?: { id: number; username: string } }
interface Catalogo { id: number; nome: string; capa?: string; capaDinamica?: string; ehColaborador?: boolean; posts: { postId: number }[] }
interface PerfilData { id: number; nome: string; username: string; bio?: string; cidade?: string; fotoPerfil?: string; fotoCapa?: string; perfilConfig?: string }
interface Contadores { seguidores: number; seguindo: number }

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
  const t = useI18n();

  const [perfil, setPerfil] = useState<PerfilData | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [catalogos, setCatalogos] = useState<Catalogo[]>([]);
  const [tab, setTab] = useState<"posts" | "catalogos">("posts");
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [seguindo, setSeguindo] = useState(false);
  const [contadores, setContadores] = useState<Contadores>({ seguidores: 0, seguindo: 0 });
  const [loadingFollow, setLoadingFollow] = useState(false);
  const [shareAberto, setShareAberto] = useState(false);
  const [toast, setToast] = useState("");
  const [modalSeg, setModalSeg] = useState<"seguidores" | "seguindo" | null>(null);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  useEffect(() => {
    if (!username) return;
    setLoading(true);
    api.get(`/usuario/username/${username}`)
      .then(async u => {
        const dados: PerfilData = u.data;
        setPerfil(dados);
        if (eu && eu.username === username) { navigate("/perfil", { replace: true }); return; }

        const [rp, rcolab, rc, cont] = await Promise.all([
          api.get(`/post/usuario/${dados.id}`).catch(() => ({ data: [] })),
          api.get(`/post/colaboracao/usuario/${dados.id}`).catch(() => ({ data: [] })),
          api.get(`/catalogo/usuario/${dados.id}`).catch(() => ({ data: [] })),
          api.get(`/seguidor/contadores/${dados.id}`).catch(() => ({ data: { data: { seguidores: 0, seguindo: 0 } } })),
        ]);

        const proprios: Post[] = Array.isArray(rp.data) ? rp.data : [];
        const colab: Post[] = Array.isArray(rcolab.data) ? rcolab.data : [];

        // Mescla sem duplicatas, ordena por id desc (mais recente primeiro)
        const idsVistos = new Set(proprios.map(p => p.id));
        const todosPosts = [
          ...proprios,
          ...colab.filter(p => !idsVistos.has(p.id)),
        ].sort((a, b) => b.id - a.id);

        setPosts(todosPosts);
        setCatalogos(Array.isArray(rc.data) ? rc.data : []);
        const c = cont.data?.data ?? cont.data;
        setContadores({ seguidores: c?.seguidores ?? 0, seguindo: c?.seguindo ?? 0 });

        if (eu) {
          const checar = await api.get(`/seguidor/checar/${eu.id}/${dados.id}`).catch(() => ({ data: { data: { seguindo: false } } }));
          const seg = checar.data?.data ?? checar.data;
          setSeguindo(seg?.seguindo ?? false);
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [username, eu?.id]);

  async function toggleSeguir() {
    if (!eu) { navigate("/cadastro"); return; }
    if (!perfil || loadingFollow) return;
    setLoadingFollow(true);
    try {
      if (seguindo) {
        await api.delete(`/seguidor/${eu.id}/${perfil.id}`);
        setSeguindo(false);
        setContadores(p => ({ ...p, seguidores: Math.max(0, p.seguidores - 1) }));
      } else {
        await api.post("/seguidor", { seguidorId: eu.id, seguidoId: perfil.id });
        setSeguindo(true);
        setContadores(p => ({ ...p, seguidores: p.seguidores + 1 }));
      }
    } catch { /* silencioso */ } finally {
      setLoadingFollow(false);
    }
  }

  const config = useMemo(() => parseConfig(perfil?.perfilConfig), [perfil?.perfilConfig]);

  const bgStyle = useMemo(() => {
    if (config.bgType === "gradient") return { background: config.bgValue };
    return { backgroundColor: config.bgValue || "#FAF8F3" };
  }, [config]);

  if (loading) return <div className="pp-loading">{t.publicProfile.loading}</div>;
  if (notFound || !perfil) return <div className="pp-loading">{t.publicProfile.notFound}</div>;

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
          {perfil.fotoPerfil ? <img src={perfil.fotoPerfil} alt={perfil.nome} onClick={() => setLightboxSrc(perfil.fotoPerfil!)} style={{ cursor: "zoom-in" }} /> : <span>{inicial}</span>}
        </div>
        <div className="pp__meta">
          <h1 className="pp__nome">
            {perfil.nome}
            {isVerificado(perfil.username) && <VerificadoIcon size={18} style={{ marginLeft: 6, verticalAlign: "middle" }} />}
          </h1>
          <span className="pp__username">@{perfil.username}</span>
          {perfil.bio && <p className="pp__bio">{perfil.bio}</p>}
          {perfil.cidade && <p className="pp__cidade">📍 {perfil.cidade}</p>}
          <div className="pp__stats">
            <span><strong>{posts.length}</strong> {t.publicProfile.posts}</span>
            <button className="pp__stat-btn" onClick={() => setModalSeg("seguidores")}>
              <strong>{contadores.seguidores}</strong> {t.publicProfile.followers}
            </button>
            <button className="pp__stat-btn" onClick={() => setModalSeg("seguindo")}>
              <strong>{contadores.seguindo}</strong> {t.publicProfile.following2}
            </button>
            <span><strong>{catalogos.length}</strong> {t.publicProfile.catalogs}</span>
          </div>

          <div className="pp__acoes">
            {eu && eu.id !== perfil.id && (
              <>
                <button
                  className={`pp__btn-seguir ${seguindo ? "pp__btn-seguir--ativo" : ""}`}
                  onClick={toggleSeguir}
                  disabled={loadingFollow}
                >
                  <UsersIcon size={14} />
                  {loadingFollow ? "..." : seguindo ? t.publicProfile.following : t.publicProfile.follow}
                </button>
                <button
                  className="pp__btn-msg"
                  onClick={() => eu ? navigate("/mensagens") : navigate("/cadastro")}
                  title={t.publicProfile.message}
                >
                  <MessageIcon size={14} />
                  {t.publicProfile.message}
                </button>
              </>
            )}
            <button
              className="pp__btn-share"
              onClick={() => setShareAberto(true)}
              title="Compartilhar perfil"
            >
              <ShareIcon size={14} />
              <span>Compartilhar</span>
            </button>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="pp__tabs">
        <button className={tab === "posts" ? "active" : ""} onClick={() => setTab("posts")}>
          {t.profile.posts} <span className="pp__tab-count">{posts.length}</span>
        </button>
        <button className={tab === "catalogos" ? "active" : ""} onClick={() => setTab("catalogos")}>
          {t.profile.catalogs} <span className="pp__tab-count">{catalogos.length}</span>
        </button>
      </div>

      {/* CONTENT */}
      {tab === "posts" && (
        <div className={`pp__galeria pp__galeria--${config.layout} pp__galeria--${config.cardStyle}`}>
          {posts.length === 0
            ? <p className="pp__empty">{t.publicProfile.noPosts}</p>
            : posts.map(post => (
              <div key={post.id} className="pp__post-card" onClick={() => navigate(`/post/${post.id}`)}>
                <div className="pp__post-img">
                  {post.imagem ? <img src={post.imagem} alt={post.titulo} /> : <div className="pp__post-no-img"><ImageOffIcon size={28} /></div>}
                </div>
                <div className="pp__post-info">
                  <span className="pp__post-titulo">{post.titulo}</span>
                  {post.autor && post.autor.id !== perfil.id && (
                    <span className="pp__post-colab-badge">com @{post.autor.username}</span>
                  )}
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
            ? <p className="pp__empty">{t.publicProfile.noCatalogs}</p>
            : catalogos.map(cat => (
              <div key={cat.id} className="pp__cat-card" onClick={() => navigate(`/catalogo/${cat.id}`)}>
                <div className="pp__cat-cover">
                  {cat.capaDinamica
                    ? <img src={cat.capaDinamica} alt={cat.nome} />
                    : <div className="pp__cat-placeholder" />}
                  {cat.ehColaborador && (
                    <span className="pp__cat-colab-tag">collab</span>
                  )}
                  <div className="pp__cat-overlay">
                    <p className="pp__cat-nome">{cat.nome}</p>
                    <span className="pp__cat-count">{cat.posts.length} item{cat.posts.length !== 1 ? "s" : ""}</span>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}

      <Footer />
      {shareAberto && (
        <ShareModal
          tipo="perfil"
          id={perfil.username}
          titulo={perfil.nome}
          subtitulo={perfil.bio}
          onClose={() => setShareAberto(false)}
        />
      )}
      {toast && <Toast mensagem={toast} visivel={!!toast} onFadeOut={() => setToast("")} />}
      {modalSeg && perfil && (
        <SeguidoresModal
          usuarioId={perfil.id}
          tipo={modalSeg}
          onClose={() => setModalSeg(null)}
        />
      )}
      {lightboxSrc && <FotoLightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />}
    </div>
  );
}
