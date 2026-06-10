import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/api";
import { uploadImagem } from "../api/upload";
import { useAuth } from "../context/AuthContext";
import { useI18n } from "../hooks/useI18n";
import Footer from "../components/Footer";
import CreatePostModal from "../components/CreatePostModal";
import CatalogoModal from "../components/CatalogoModal";
import EditPostModal from "../components/EditPostModal";
import {
  HeartIcon, CommentIcon, ImageOffIcon,
  PlusIcon, PaletteIcon, CameraIcon, TrashIcon,
  GridIcon, ListIcon, ShareIcon, VerificadoIcon, PlayIcon,
} from "../components/Icons";
import { isVideo, videoThumbnail } from "../utils/midia";
import Toast from "../components/Toast";
import ImageEditor from "../components/ImageEditor";
import ShareModal from "../components/ShareModal";
import { isVerificado } from "../utils/verificado";
import "../styles/components/Perfil.scss";

interface Post { id: number; titulo: string; descricao?: string; imagem?: string; imagens?: string[]; thumbnails?: string[]; curtidas: { id: number }[]; comentarios: { id: number }[]; autor?: { id: number; username: string } }
interface Catalogo { id: number; nome: string; capa?: string; capaDinamica?: string; ehColaborador?: boolean; posts: { postId: number }[] }
interface PostSalvo { id: number; titulo: string; imagem?: string; imagens?: string[]; thumbnails?: string[]; curtidas: { id: number }[]; comentarios: { id: number }[]; autor?: { id: number; username: string } }
interface CatalogoSalvo { id: number; nome: string; capaDinamica?: string; dono?: { username: string }; posts: { postId?: number }[] }

interface ProfileConfig {
  bgType: "solid" | "gradient" | "texture";
  bgValue: string;
  cardStyle: "rounded" | "sharp" | "glass" | "polaroid" | "minimal";
  layout: "grid" | "compact" | "list";
}

const DEFAULT_CONFIG: ProfileConfig = {
  bgType: "solid", bgValue: "#FAF8F3", cardStyle: "rounded", layout: "grid",
};

function parseConfig(raw?: string): ProfileConfig {
  if (!raw) return DEFAULT_CONFIG;
  try { return { ...DEFAULT_CONFIG, ...JSON.parse(raw) }; } catch { return DEFAULT_CONFIG; }
}

const BG_SOLIDS = ["#FAF8F3", "#E8F0E4", "#F5EFE6", "#F5E8E8", "#F0ECF5", "#E8EEF5", "#2C2C2C", "#1C2616"];
const BG_GRADIENTS = [
  "linear-gradient(135deg,#EBF0E4,#5C7A3A)",
  "linear-gradient(135deg,#FAF0E4,#F5C58A,#E8947A)",
  "linear-gradient(135deg,#E0F2F1,#80CBC4)",
  "linear-gradient(135deg,#EDE8F5,#B39DDB)",
  "linear-gradient(135deg,#FDF8E8,#C4A96A)",
  "linear-gradient(135deg,#F5F5F5,#9E9E9E)",
];

export default function Perfil() {
  const { usuario, updateUsuario } = useAuth();
  const navigate = useNavigate();
  const t = useI18n();

  const [posts, setPosts] = useState<Post[]>([]);
  const [catalogos, setCatalogos] = useState<Catalogo[]>([]);
  const [postsSalvos, setPostsSalvos] = useState<PostSalvo[]>([]);
  const [catalogosSalvos, setCatalogosSalvos] = useState<CatalogoSalvo[]>([]);
  const [contadores, setContadores] = useState({ seguidores: 0, seguindo: 0 });
  const [carregando, setCarregando] = useState(true);
  const [tab, setTab] = useState<"posts" | "catalogos" | "salvos">("posts");
  const [toast, setToast] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [shareAberto, setShareAberto] = useState(false);
  const [showCatalogoModal, setShowCatalogoModal] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const [config, setConfig] = useState<ProfileConfig>(DEFAULT_CONFIG);
  const [editData, setEditData] = useState({ nome: "", bio: "", cidade: "", contato: "" });
  const [excluindo, setExcluindo] = useState<number | null>(null);
  const [menuPostAberto, setMenuPostAberto] = useState<number | null>(null);
  const [editandoPost, setEditandoPost] = useState<Post | null>(null);
  const [salvandoConfig, setSalvandoConfig] = useState(false);
  const [salvandoPerfil, setSalvandoPerfil] = useState(false);

  const bannerRef = useRef<HTMLInputElement>(null);
  const avatarRef = useRef<HTMLInputElement>(null);
  const menuCapaRef = useRef<HTMLDivElement>(null);
  const menuAvatarRef = useRef<HTMLDivElement>(null);
  const [menuFotoAberto, setMenuFotoAberto] = useState<"capa" | "avatar" | null>(null);

  const [editorState, setEditorState] = useState<{ file: File; mode: "avatar" | "capa" } | null>(null);

  const cardStyles: { key: ProfileConfig["cardStyle"]; label: string }[] = [
    { key: "rounded", label: t.profile.cardOpts.rounded },
    { key: "sharp",   label: t.profile.cardOpts.sharp },
    { key: "glass",   label: t.profile.cardOpts.glass },
    { key: "polaroid",label: t.profile.cardOpts.polaroid },
    { key: "minimal", label: t.profile.cardOpts.minimal },
  ];

  async function carregarDados() {
    if (!usuario) return;
    try {
      const [rp, rcolab, rc, rcont, rps, rcs] = await Promise.all([
        api.get(`/post/usuario/${usuario.id}`),
        api.get(`/post/colaboracao/usuario/${usuario.id}`).catch(() => ({ data: [] })),
        api.get(`/catalogo/usuario/${usuario.id}`),
        api.get(`/seguidor/contadores/${usuario.id}`).catch(() => ({ data: { data: { seguidores: 0, seguindo: 0 } } })),
        api.get(`/post-salvo/${usuario.id}`).catch(() => ({ data: [] })),
        api.get(`/catalogo-salvo/${usuario.id}`).catch(() => ({ data: [] })),
      ]);
      const proprios: Post[] = Array.isArray(rp.data) ? rp.data : [];
      const colab: Post[] = Array.isArray(rcolab.data) ? rcolab.data : [];
      const idsVistos = new Set(proprios.map(p => p.id));
      const todos = [
        ...proprios,
        ...colab.filter(p => !idsVistos.has(p.id)),
      ].sort((a, b) => b.id - a.id);
      setPosts(todos);
      setCatalogos(Array.isArray(rc.data) ? rc.data : []);
      const c = rcont.data?.data ?? rcont.data;
      setContadores({ seguidores: c?.seguidores ?? 0, seguindo: c?.seguindo ?? 0 });
      setPostsSalvos(Array.isArray(rps.data) ? rps.data : []);
      setCatalogosSalvos(Array.isArray(rcs.data) ? rcs.data : []);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    function fecharMenus(e: MouseEvent) {
      const alvo = e.target as Node;
      const dentroCapa = menuCapaRef.current?.contains(alvo);
      const dentroAvatar = menuAvatarRef.current?.contains(alvo);
      if (!dentroCapa && !dentroAvatar) setMenuFotoAberto(null);
    }
    document.addEventListener("mousedown", fecharMenus);
    return () => document.removeEventListener("mousedown", fecharMenus);
  }, []);

  useEffect(() => {
    carregarDados();
    setConfig(parseConfig(usuario?.perfilConfig));
    setEditData({
      nome: usuario?.nome ?? "",
      bio: usuario?.bio ?? "",
      cidade: usuario?.cidade ?? "",
      contato: usuario?.contato ?? "",
    });
  }, [usuario?.id]);

  const bgStyle = useMemo(() => {
    if (config.bgType === "gradient") return { background: config.bgValue };
    if (config.bgType === "texture") return { backgroundColor: config.bgValue };
    return { backgroundColor: config.bgValue || "#FAF8F3" };
  }, [config]);

  function uploadBanner(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !usuario) return;
    e.target.value = "";
    setEditorState({ file, mode: "capa" });
  }

  function uploadAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !usuario) return;
    e.target.value = "";
    setEditorState({ file, mode: "avatar" });
  }

  async function handleEditorConfirm(blob: Blob) {
    if (!usuario || !editorState) return;
    const mode = editorState.mode;
    const file = new File([blob], "image.jpg", { type: "image/jpeg" });
    setEditorState(null);
    try {
      const url = await uploadImagem(file);
      if (mode === "capa") {
        await api.put(`/usuario/${usuario.id}`, { fotoCapa: url });
        updateUsuario({ fotoCapa: url });
      } else {
        await api.put(`/usuario/${usuario.id}`, { fotoPerfil: url });
        updateUsuario({ fotoPerfil: url });
      }
    } catch {
      alert("Erro ao salvar a foto. Tente novamente.");
    }
  }

  async function removerBanner() {
    if (!usuario) return;
    await api.put(`/usuario/${usuario.id}`, { fotoCapa: "" });
    updateUsuario({ fotoCapa: "" });
  }

  async function removerAvatar() {
    if (!usuario) return;
    await api.put(`/usuario/${usuario.id}`, { fotoPerfil: "" });
    updateUsuario({ fotoPerfil: "" });
  }

  async function salvarPerfil() {
    if (!usuario) return;
    setEditMode(false);
    setSalvandoPerfil(true);
    try {
      await api.put(`/usuario/${usuario.id}`, editData);
      updateUsuario(editData);
    } catch { /* silencioso */ }
    finally { setSalvandoPerfil(false); }
  }

  async function salvarConfig(newCfg: ProfileConfig) {
    if (!usuario) return;
    setConfig(newCfg);
    setShowCustomize(false);
    setSalvandoConfig(true);
    const json = JSON.stringify(newCfg);
    try {
      await api.put(`/usuario/${usuario.id}`, { perfilConfig: json });
      updateUsuario({ perfilConfig: json });
    } catch { /* silencioso */ }
    finally { setSalvandoConfig(false); }
  }

  async function excluirPost(e: React.MouseEvent, id: number) {
    e.stopPropagation();
    if (!confirm(t.postDetail.deleteConfirm)) return;
    setExcluindo(id);
    try { await api.delete(`/post/${id}`); carregarDados(); }
    catch { /* silencioso */ }
    finally { setExcluindo(null); }
  }

  async function sairColaboracao(e: React.MouseEvent, postId: number) {
    e.stopPropagation();
    if (!confirm("Remover esta publicação do seu perfil? O post continuará no perfil do autor.")) return;
    setExcluindo(postId);
    try { await api.delete(`/post/colaboracao/${postId}/${usuario?.id}`); carregarDados(); }
    catch { /* silencioso */ }
    finally { setExcluindo(null); }
  }

  const inicial = usuario?.nome?.charAt(0).toUpperCase() ?? "?";

  return (
    <>
    {editorState && (
      <ImageEditor
        file={editorState.file}
        aspect={editorState.mode === "capa" ? 3 : 1}
        circular={editorState.mode === "avatar"}
        onConfirm={handleEditorConfirm}
        onCancel={() => setEditorState(null)}
      />
    )}
    <div
      className={`perfil ${config.bgType === "texture" ? `perfil--texture-${config.bgValue}` : ""}`}
      style={bgStyle}
    >
      {/* ── BANNER ── */}
      <div className="perfil__banner">
        {usuario?.fotoCapa
          ? <img src={usuario.fotoCapa} alt="capa" />
          : <div className="perfil__banner-placeholder" />}
        <div className="perfil__banner-cam-wrap" ref={menuCapaRef}>
          <button
            className="perfil__banner-cam-btn"
            onClick={() => setMenuFotoAberto(v => v === "capa" ? null : "capa")}
          >
            <CameraIcon size={16} />
          </button>
          {menuFotoAberto === "capa" && (
            <div className="perfil__foto-menu">
              <button onClick={() => { setMenuFotoAberto(null); bannerRef.current?.click(); }}>
                Mudar capa
              </button>
              {usuario?.fotoCapa && (
                <button className="perfil__foto-menu--del" onClick={() => { setMenuFotoAberto(null); removerBanner(); }}>
                  Remover capa
                </button>
              )}
            </div>
          )}
        </div>
        <input ref={bannerRef} type="file" accept="image/*" hidden onChange={uploadBanner} />
      </div>

      {/* ── PROFILE CARD ── */}
      <div className="perfil__card">
        <div className="perfil__avatar-wrap">
          <div className="perfil__avatar">
            {usuario?.fotoPerfil
              ? <img src={usuario.fotoPerfil} alt={usuario.nome} />
              : <span>{inicial}</span>}
          </div>
          <div className="perfil__avatar-cam-wrap" ref={menuAvatarRef}>
            <button
              className="perfil__avatar-btn"
              onClick={() => setMenuFotoAberto(v => v === "avatar" ? null : "avatar")}
            >
              <CameraIcon size={12} />
            </button>
            {menuFotoAberto === "avatar" && (
              <div className="perfil__foto-menu perfil__foto-menu--avatar">
                <button onClick={() => { setMenuFotoAberto(null); avatarRef.current?.click(); }}>
                  Mudar foto
                </button>
                {usuario?.fotoPerfil && (
                  <button className="perfil__foto-menu--del" onClick={() => { setMenuFotoAberto(null); removerAvatar(); }}>
                    Remover foto
                  </button>
                )}
              </div>
            )}
          </div>
          <input ref={avatarRef} type="file" accept="image/*" hidden onChange={uploadAvatar} />
        </div>

        {editMode ? (
          <div className="perfil__edit-form">
            <input className="perfil__edit-input" placeholder={t.profile.namePlaceholder} value={editData.nome} onChange={e => setEditData(p => ({ ...p, nome: e.target.value }))} />
            <textarea className="perfil__edit-textarea" placeholder={t.profile.bioPlaceholder} value={editData.bio} onChange={e => setEditData(p => ({ ...p, bio: e.target.value }))} maxLength={160} />
            <input className="perfil__edit-input" placeholder={t.profile.cityPlaceholder} value={editData.cidade} onChange={e => setEditData(p => ({ ...p, cidade: e.target.value }))} />
            <input className="perfil__edit-input" placeholder={t.profile.contactPlaceholder} value={editData.contato} onChange={e => setEditData(p => ({ ...p, contato: e.target.value }))} />
            <div className="perfil__edit-actions">
              <button className="perfil__btn-salvar" onClick={salvarPerfil} disabled={salvandoPerfil}>{salvandoPerfil ? t.common.saving : t.common.save}</button>
              <button className="perfil__btn-cancelar" onClick={() => setEditMode(false)}>{t.common.cancel}</button>
            </div>
          </div>
        ) : (
          <div className="perfil__meta">
            <h1 className="perfil__nome">
              {usuario?.nome}
              {isVerificado(usuario?.username) && <VerificadoIcon size={18} style={{ marginLeft: 6, verticalAlign: "middle" }} />}
            </h1>
            <span className="perfil__username">@{usuario?.username}</span>
            {usuario?.bio && <p className="perfil__bio">{usuario.bio}</p>}
            {usuario?.cidade && <p className="perfil__cidade">📍 {usuario.cidade}</p>}
            <div className="perfil__stats">
              <span><strong>{posts.length}</strong> {t.profile.posts.toLowerCase()}</span>
              <span><strong>{catalogos.length}</strong> {t.profile.catalogs.toLowerCase()}</span>
              <span><strong>{contadores.seguidores}</strong> {t.profile.followers}</span>
              <span><strong>{contadores.seguindo}</strong> {t.profile.following}</span>
            </div>
          </div>
        )}

        <div className="perfil__actions">
          {!editMode && (
            <>
              <button className="perfil__btn-editar" onClick={() => setEditMode(true)}>{t.profile.editProfile}</button>
              <button className="perfil__btn-custom" onClick={() => setShowCustomize(true)}>
                <PaletteIcon size={15} />
              </button>
              <button className="perfil__btn-share" onClick={() => setShareAberto(true)} title={t.profile.shareProfile}>
                <ShareIcon size={15} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── TABS + NOVO POST ── */}
      <div className="perfil__tabbar">
        <div className="perfil__tabs">
          <button className={tab === "posts" ? "active" : ""} onClick={() => setTab("posts")}>
            {t.profile.posts} <span className="perfil__tab-count">{posts.length}</span>
          </button>
          <button className={tab === "catalogos" ? "active" : ""} onClick={() => setTab("catalogos")}>
            {t.profile.catalogs} <span className="perfil__tab-count">{catalogos.length}</span>
          </button>
          <button className={tab === "salvos" ? "active" : ""} onClick={() => setTab("salvos")}>
            {t.profile.saved} <span className="perfil__tab-count">{postsSalvos.length + catalogosSalvos.length}</span>
          </button>
        </div>
        {tab !== "salvos" && (
          <button
            className="perfil__novo-btn"
            onClick={() => tab === "catalogos" ? setShowCatalogoModal(true) : setShowModal(true)}
          >
            <PlusIcon size={14} /> {tab === "catalogos" ? t.profile.newCatalog : t.profile.newPost}
          </button>
        )}
      </div>

      {/* ── GALLERY ── */}
      {tab === "posts" && (
        carregando ? (
          <div className="perfil__skeleton-grid">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="perfil__skeleton" />)}
          </div>
        ) : posts.length === 0 ? (
          <div className="perfil__empty">
            <p>{t.profile.noPosts}</p>
          </div>
        ) : (
          <div className={`perfil__galeria perfil__galeria--${config.layout} perfil__galeria--${config.cardStyle}`}>
            {posts.map(post => (
              <div key={post.id} className="perfil__post-card" onClick={() => navigate(`/post/${post.id}`)}>
                <div className="perfil__post-img">
                  {(() => {
                    const url = post.imagens?.[0] ?? post.imagem;
                    if (!url) return <div className="perfil__post-no-img"><ImageOffIcon size={26} /></div>;
                    if (isVideo(url)) return (
                      <>
                        <img src={videoThumbnail(url, post.thumbnails?.[0])} alt={post.titulo} />
                        <span className="perfil__post-play"><PlayIcon size={18} /></span>
                      </>
                    );
                    return <img src={url} alt={post.titulo} />;
                  })()}
                </div>
                <div className="perfil__post-info">
                  <span className="perfil__post-titulo">{post.titulo}</span>
                  {post.autor && post.autor.id !== usuario?.id && (
                    <span className="perfil__post-colab-badge">com @{post.autor.username}</span>
                  )}
                  <div className="perfil__post-row">
                    <span className="perfil__post-stats">
                      <HeartIcon size={11} filled /> {post.curtidas.length}
                      &nbsp;&nbsp;<CommentIcon size={11} /> {post.comentarios.length}
                    </span>
                    {post.autor && post.autor.id !== usuario?.id ? (
                      <button
                        className="perfil__post-del perfil__post-del--sair"
                        onClick={e => sairColaboracao(e, post.id)}
                        disabled={excluindo === post.id}
                        title="Sair da colaboração"
                      >
                        <TrashIcon size={13} />
                      </button>
                    ) : (
                      <div className="perfil__post-menu-wrap" onClick={e => e.stopPropagation()}>
                        <button
                          className="perfil__post-menu-btn"
                          onClick={() => setMenuPostAberto(menuPostAberto === post.id ? null : post.id)}
                        >⋮</button>
                        {menuPostAberto === post.id && (
                          <div className="perfil__post-menu-dropdown">
                            <button onClick={e => { e.stopPropagation(); setMenuPostAberto(null); setEditandoPost(post); }}>
                              {t.postDetail.editPost}
                            </button>
                            <button
                              className="perfil__post-menu-excluir"
                              onClick={e => { e.stopPropagation(); setMenuPostAberto(null); excluirPost(e, post.id); }}
                            >
                              {t.postDetail.deletePost}
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {tab === "catalogos" && (
        <div className="perfil__cat-grid">
          {catalogos.length === 0 ? (
            <p className="perfil__empty-txt">{t.profile.noCatalogs}</p>
          ) : catalogos.map(cat => (
            <div key={cat.id} className="perfil__cat-card" onClick={() => navigate(`/catalogo/${cat.id}`)}>
              <div className="perfil__cat-cover">
                {cat.capaDinamica
                  ? <img src={cat.capaDinamica} alt={cat.nome} />
                  : <div className="perfil__cat-placeholder" />}
                {cat.ehColaborador && (
                  <span className="perfil__cat-colab-tag">collab</span>
                )}
                <div className="perfil__cat-overlay">
                  <p className="perfil__cat-nome">{cat.nome}</p>
                  <span className="perfil__cat-count">{cat.posts.length} item{cat.posts.length !== 1 ? "s" : ""}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── SALVOS (privado) ── */}
      {tab === "salvos" && (
        <div className="perfil__salvos">
          <div className="perfil__salvos-aviso">
            {t.profile.savedPrivate}
          </div>

          {postsSalvos.length === 0 && catalogosSalvos.length === 0 ? (
            <div className="perfil__empty">
              <p>{t.profile.noSaved}</p>
              <p style={{ fontSize: "0.85rem", color: "#8A9E7A", marginTop: 4 }}>
                {t.profile.savedHint}
              </p>
            </div>
          ) : (
            <>
              {postsSalvos.length > 0 && (
                <>
                  <p className="perfil__salvos-secao">{t.profile.savedPostsTitle(postsSalvos.length)}</p>
                  <div className={`perfil__galeria perfil__galeria--${config.layout} perfil__galeria--${config.cardStyle}`}>
                    {postsSalvos.map(post => (
                      <div key={post.id} className="perfil__post-card" onClick={() => navigate(`/post/${post.id}`)}>
                        <div className="perfil__post-img">
                          {(() => {
                            const url = post.imagens?.[0] ?? post.imagem;
                            if (!url) return <div className="perfil__post-no-img"><ImageOffIcon size={26} /></div>;
                            if (isVideo(url)) return (
                              <>
                                <img src={videoThumbnail(url, post.thumbnails?.[0])} alt={post.titulo} />
                                <span className="perfil__post-play"><PlayIcon size={18} /></span>
                              </>
                            );
                            return <img src={url} alt={post.titulo} />;
                          })()}
                        </div>
                        <div className="perfil__post-info">
                          <span className="perfil__post-titulo">{post.titulo}</span>
                          {post.autor && (
                            <span className="perfil__post-colab-badge">@{post.autor.username}</span>
                          )}
                          <div className="perfil__post-row">
                            <span className="perfil__post-stats">
                              <HeartIcon size={11} filled /> {post.curtidas.length}
                              &nbsp;&nbsp;<CommentIcon size={11} /> {post.comentarios.length}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {catalogosSalvos.length > 0 && (
                <>
                  <p className="perfil__salvos-secao" style={{ marginTop: postsSalvos.length > 0 ? "2rem" : 0 }}>
                    {t.profile.savedCatalogsTitle(catalogosSalvos.length)}
                  </p>
                  <div className="perfil__cat-grid">
                    {catalogosSalvos.map(cat => (
                      <div key={cat.id} className="perfil__cat-card" onClick={() => navigate(`/catalogo/${cat.id}`)}>
                        <div className="perfil__cat-cover">
                          {cat.capaDinamica
                            ? <img src={cat.capaDinamica} alt={cat.nome} />
                            : <div className="perfil__cat-placeholder" />}
                          <div className="perfil__cat-overlay">
                            <p className="perfil__cat-nome">{cat.nome}</p>
                            {cat.dono && (
                              <span className="perfil__cat-count">@{cat.dono.username}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      )}

      {/* ── CUSTOMIZATION PANEL ── */}
      {showCustomize && (
        <div className="perfil__custom-overlay" onClick={() => setShowCustomize(false)}>
          <div className="perfil__custom-panel" onClick={e => e.stopPropagation()}>
            <div className="perfil__custom-header">
              <span>{t.profile.customize}</span>
              <button onClick={() => setShowCustomize(false)}>✕</button>
            </div>

            <div className="perfil__custom-body">
              <section className="perfil__custom-section">
                <p className="perfil__custom-label">{t.profile.solidBg}</p>
                <div className="perfil__color-swatches">
                  {BG_SOLIDS.map(c => (
                    <button
                      key={c}
                      className={`perfil__swatch ${config.bgType === "solid" && config.bgValue === c ? "active" : ""}`}
                      style={{ background: c, border: c === "#FAF8F3" ? "1px solid #E0D9CC" : "none" }}
                      onClick={() => setConfig(p => ({ ...p, bgType: "solid", bgValue: c }))}
                    />
                  ))}
                </div>
              </section>

              <section className="perfil__custom-section">
                <p className="perfil__custom-label">{t.profile.gradient}</p>
                <div className="perfil__color-swatches">
                  {BG_GRADIENTS.map(g => (
                    <button
                      key={g}
                      className={`perfil__swatch ${config.bgType === "gradient" && config.bgValue === g ? "active" : ""}`}
                      style={{ background: g }}
                      onClick={() => setConfig(p => ({ ...p, bgType: "gradient", bgValue: g }))}
                    />
                  ))}
                </div>
              </section>

              <section className="perfil__custom-section">
                <p className="perfil__custom-label">{t.profile.texture}</p>
                <div className="perfil__texture-opts">
                  {([["dots", t.profile.textureOpts.dots], ["grid", t.profile.textureOpts.grid], ["diagonal", t.profile.textureOpts.diagonal]] as [string, string][]).map(([key, label]) => (
                    <button
                      key={key}
                      className={`perfil__texture-btn ${config.bgType === "texture" && config.bgValue === key ? "active" : ""}`}
                      onClick={() => setConfig(p => ({ ...p, bgType: "texture", bgValue: key }))}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </section>

              <section className="perfil__custom-section">
                <p className="perfil__custom-label">{t.profile.cardStyle}</p>
                <div className="perfil__style-opts">
                  {cardStyles.map(s => (
                    <button
                      key={s.key}
                      className={`perfil__style-btn ${config.cardStyle === s.key ? "active" : ""}`}
                      onClick={() => setConfig(p => ({ ...p, cardStyle: s.key }))}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </section>

              <section className="perfil__custom-section">
                <p className="perfil__custom-label">{t.profile.galleryLayout}</p>
                <div className="perfil__layout-opts">
                  <button className={`perfil__layout-btn ${config.layout === "grid" ? "active" : ""}`} onClick={() => setConfig(p => ({ ...p, layout: "grid" }))}>
                    <GridIcon size={18} /> {t.profile.layoutOpts.grid}
                  </button>
                  <button className={`perfil__layout-btn ${config.layout === "compact" ? "active" : ""}`} onClick={() => setConfig(p => ({ ...p, layout: "compact" }))}>
                    <GridIcon size={18} /> {t.profile.layoutOpts.compact}
                  </button>
                  <button className={`perfil__layout-btn ${config.layout === "list" ? "active" : ""}`} onClick={() => setConfig(p => ({ ...p, layout: "list" }))}>
                    <ListIcon size={18} /> {t.profile.layoutOpts.list}
                  </button>
                </div>
              </section>
            </div>

            <div className="perfil__custom-footer">
              <button className="perfil__custom-save" onClick={() => salvarConfig(config)} disabled={salvandoConfig}>
                {salvandoConfig ? t.common.saving : t.profile.saveCustomization}
              </button>
            </div>
          </div>
        </div>
      )}

      {shareAberto && usuario && (
        <ShareModal
          tipo="perfil"
          id={usuario.username}
          titulo={usuario.nome}
          subtitulo={usuario.bio}
          onClose={() => setShareAberto(false)}
        />
      )}
      {showModal && <CreatePostModal onClose={() => setShowModal(false)} onSuccess={carregarDados} />}
      {showCatalogoModal && <CatalogoModal onClose={() => setShowCatalogoModal(false)} />}
      {editandoPost && (
        <EditPostModal
          id={editandoPost.id}
          tituloInicial={editandoPost.titulo}
          descricaoInicial={editandoPost.descricao}
          tagsIniciais={(editandoPost as any).tags}
          onClose={() => setEditandoPost(null)}
          onSuccess={carregarDados}
        />
      )}
      {toast && <Toast mensagem={toast} visivel={!!toast} onFadeOut={() => setToast("")} />}

      <Footer />
    </div>
    </>
  );
}
