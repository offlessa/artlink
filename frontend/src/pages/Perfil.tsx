import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/api";
import { uploadImagem } from "../api/upload";
import { useAuth } from "../context/AuthContext";
import Footer from "../components/Footer";
import CreatePostModal from "../components/CreatePostModal";
import CatalogoModal from "../components/CatalogoModal";
import {
  HeartIcon, CommentIcon, ImageOffIcon,
  PlusIcon, PaletteIcon, CameraIcon, TrashIcon,
  GridIcon, ListIcon, ShareIcon,
} from "../components/Icons";
import Toast from "../components/Toast";
import "../styles/components/Perfil.scss";

interface Post { id: number; titulo: string; imagem?: string; curtidas: { id: number }[]; comentarios: { id: number }[]; autor?: { id: number; username: string } }
interface Catalogo { id: number; nome: string; capa?: string; capaDinamica?: string; ehColaborador?: boolean; posts: { postId: number }[] }
interface PostSalvo { id: number; titulo: string; imagem?: string; curtidas: { id: number }[]; comentarios: { id: number }[]; autor?: { id: number; username: string } }
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
const CARD_STYLES: { key: ProfileConfig["cardStyle"]; label: string }[] = [
  { key: "rounded", label: "Arredondado" },
  { key: "sharp", label: "Reto" },
  { key: "glass", label: "Vidro" },
  { key: "polaroid", label: "Polaroid" },
  { key: "minimal", label: "Minimal" },
];

export default function Perfil() {
  const { usuario, updateUsuario } = useAuth();
  const navigate = useNavigate();

  const [posts, setPosts] = useState<Post[]>([]);
  const [catalogos, setCatalogos] = useState<Catalogo[]>([]);
  const [postsSalvos, setPostsSalvos] = useState<PostSalvo[]>([]);
  const [catalogosSalvos, setCatalogosSalvos] = useState<CatalogoSalvo[]>([]);
  const [contadores, setContadores] = useState({ seguidores: 0, seguindo: 0 });
  const [carregando, setCarregando] = useState(true);
  const [tab, setTab] = useState<"posts" | "catalogos" | "salvos">("posts");
  const [toast, setToast] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [showCatalogoModal, setShowCatalogoModal] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const [config, setConfig] = useState<ProfileConfig>(DEFAULT_CONFIG);
  const [editData, setEditData] = useState({ nome: "", bio: "", cidade: "", contato: "" });
  const [excluindo, setExcluindo] = useState<number | null>(null);
  const [salvandoConfig, setSalvandoConfig] = useState(false);
  const [salvandoPerfil, setSalvandoPerfil] = useState(false);

  const bannerRef = useRef<HTMLInputElement>(null);
  const avatarRef = useRef<HTMLInputElement>(null);

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

  function compartilharPerfil() {
    const url = `${window.location.origin}/u/${usuario?.username}`;
    navigator.clipboard.writeText(url).then(() => {
      setToast("Link copiado!");
      setTimeout(() => setToast(""), 2500);
    }).catch(() => {});
  }

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

  async function uploadBanner(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !usuario) return;
    const url = await uploadImagem(file);
    await api.put(`/usuario/${usuario.id}`, { fotoCapa: url });
    updateUsuario({ fotoCapa: url });
  }

  async function uploadAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !usuario) return;
    const url = await uploadImagem(file);
    await api.put(`/usuario/${usuario.id}`, { fotoPerfil: url });
    updateUsuario({ fotoPerfil: url });
  }

  async function salvarPerfil() {
    if (!usuario) return;
    setSalvandoPerfil(true);
    try {
      await api.put(`/usuario/${usuario.id}`, editData);
      updateUsuario(editData);
      setEditMode(false);
    } finally {
      setSalvandoPerfil(false);
    }
  }

  async function salvarConfig(newCfg: ProfileConfig) {
    if (!usuario) return;
    setSalvandoConfig(true);
    const json = JSON.stringify(newCfg);
    try {
      await api.put(`/usuario/${usuario.id}`, { perfilConfig: json });
      updateUsuario({ perfilConfig: json });
      setConfig(newCfg);
    } finally {
      setSalvandoConfig(false);
    }
  }

  async function excluirPost(e: React.MouseEvent, id: number) {
    e.stopPropagation();
    if (!confirm("Excluir esta publicação?")) return;
    setExcluindo(id);
    try { await api.delete(`/post/${id}`); carregarDados(); }
    catch { alert("Erro ao excluir."); }
    finally { setExcluindo(null); }
  }

  async function sairColaboracao(e: React.MouseEvent, postId: number) {
    e.stopPropagation();
    if (!confirm("Remover esta publicação do seu perfil? O post continuará no perfil do autor.")) return;
    setExcluindo(postId);
    try { await api.delete(`/post/colaboracao/${postId}/${usuario?.id}`); carregarDados(); }
    catch { alert("Erro ao sair da colaboração."); }
    finally { setExcluindo(null); }
  }

  const inicial = usuario?.nome?.charAt(0).toUpperCase() ?? "?";

  return (
    <div
      className={`perfil ${config.bgType === "texture" ? `perfil--texture-${config.bgValue}` : ""}`}
      style={bgStyle}
    >
      {/* ── BANNER ── */}
      <div className="perfil__banner">
        {usuario?.fotoCapa
          ? <img src={usuario.fotoCapa} alt="capa" />
          : <div className="perfil__banner-placeholder" />}
        <button className="perfil__banner-btn" onClick={() => bannerRef.current?.click()}>
          <CameraIcon size={15} /> Mudar capa
        </button>
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
          <button className="perfil__avatar-btn" onClick={() => avatarRef.current?.click()}>
            <CameraIcon size={12} />
          </button>
          <input ref={avatarRef} type="file" accept="image/*" hidden onChange={uploadAvatar} />
        </div>

        {editMode ? (
          <div className="perfil__edit-form">
            <input className="perfil__edit-input" placeholder="Nome" value={editData.nome} onChange={e => setEditData(p => ({ ...p, nome: e.target.value }))} />
            <textarea className="perfil__edit-textarea" placeholder="Bio" value={editData.bio} onChange={e => setEditData(p => ({ ...p, bio: e.target.value }))} maxLength={160} />
            <input className="perfil__edit-input" placeholder="Cidade" value={editData.cidade} onChange={e => setEditData(p => ({ ...p, cidade: e.target.value }))} />
            <input className="perfil__edit-input" placeholder="Contato / site" value={editData.contato} onChange={e => setEditData(p => ({ ...p, contato: e.target.value }))} />
            <div className="perfil__edit-actions">
              <button className="perfil__btn-salvar" onClick={salvarPerfil} disabled={salvandoPerfil}>{salvandoPerfil ? "Salvando..." : "Salvar"}</button>
              <button className="perfil__btn-cancelar" onClick={() => setEditMode(false)}>Cancelar</button>
            </div>
          </div>
        ) : (
          <div className="perfil__meta">
            <h1 className="perfil__nome">{usuario?.nome}</h1>
            <span className="perfil__username">@{usuario?.username}</span>
            {usuario?.bio && <p className="perfil__bio">{usuario.bio}</p>}
            {usuario?.cidade && <p className="perfil__cidade">📍 {usuario.cidade}</p>}
            <div className="perfil__stats">
              <span><strong>{posts.length}</strong> posts</span>
              <span><strong>{catalogos.length}</strong> catálogos</span>
              <span><strong>{contadores.seguidores}</strong> seguidores</span>
              <span><strong>{contadores.seguindo}</strong> seguindo</span>
            </div>
          </div>
        )}

        <div className="perfil__actions">
          {!editMode && (
            <>
              <button className="perfil__btn-editar" onClick={() => setEditMode(true)}>Editar perfil</button>
              <button className="perfil__btn-custom" onClick={() => setShowCustomize(true)}>
                <PaletteIcon size={15} />
              </button>
              <button className="perfil__btn-share" onClick={compartilharPerfil} title="Compartilhar perfil">
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
            Posts <span className="perfil__tab-count">{posts.length}</span>
          </button>
          <button className={tab === "catalogos" ? "active" : ""} onClick={() => setTab("catalogos")}>
            Catálogos <span className="perfil__tab-count">{catalogos.length}</span>
          </button>
          <button className={tab === "salvos" ? "active" : ""} onClick={() => setTab("salvos")}>
            Salvos <span className="perfil__tab-count">{postsSalvos.length + catalogosSalvos.length}</span>
          </button>
        </div>
        {tab !== "salvos" && (
          <button
            className="perfil__novo-btn"
            onClick={() => tab === "catalogos" ? setShowCatalogoModal(true) : setShowModal(true)}
          >
            <PlusIcon size={14} /> {tab === "catalogos" ? "Novo catálogo" : "Nova publicação"}
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
            <p>Nenhuma publicação ainda.</p>
            <button className="perfil__empty-btn" onClick={() => setShowModal(true)}>
              <PlusIcon size={14} /> Criar primeira publicação
            </button>
          </div>
        ) : (
          <div className={`perfil__galeria perfil__galeria--${config.layout} perfil__galeria--${config.cardStyle}`}>
            {posts.map(post => (
              <div key={post.id} className="perfil__post-card" onClick={() => navigate(`/post/${post.id}`)}>
                <div className="perfil__post-img">
                  {post.imagem
                    ? <img src={post.imagem} alt={post.titulo} />
                    : <div className="perfil__post-no-img"><ImageOffIcon size={26} /></div>}
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
                      <button
                        className="perfil__post-del"
                        onClick={e => excluirPost(e, post.id)}
                        disabled={excluindo === post.id}
                        title="Excluir"
                      >
                        <TrashIcon size={13} />
                      </button>
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
            <p className="perfil__empty-txt">Nenhum catálogo ainda.</p>
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
            🔒 Apenas você vê seus itens salvos
          </div>

          {postsSalvos.length === 0 && catalogosSalvos.length === 0 ? (
            <div className="perfil__empty">
              <p>Nenhum item salvo ainda.</p>
              <p style={{ fontSize: "0.85rem", color: "#8A9E7A", marginTop: 4 }}>
                Use o ícone 🔖 em posts e catálogos para salvá-los aqui.
              </p>
            </div>
          ) : (
            <>
              {postsSalvos.length > 0 && (
                <>
                  <p className="perfil__salvos-secao">Posts salvos ({postsSalvos.length})</p>
                  <div className={`perfil__galeria perfil__galeria--${config.layout} perfil__galeria--${config.cardStyle}`}>
                    {postsSalvos.map(post => (
                      <div key={post.id} className="perfil__post-card" onClick={() => navigate(`/post/${post.id}`)}>
                        <div className="perfil__post-img">
                          {post.imagem
                            ? <img src={post.imagem} alt={post.titulo} />
                            : <div className="perfil__post-no-img"><ImageOffIcon size={26} /></div>}
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
                    Catálogos salvos ({catalogosSalvos.length})
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
              <span>Personalizar perfil</span>
              <button onClick={() => setShowCustomize(false)}>✕</button>
            </div>

            <div className="perfil__custom-body">
              <section className="perfil__custom-section">
                <p className="perfil__custom-label">Fundo sólido</p>
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
                <p className="perfil__custom-label">Gradiente</p>
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
                <p className="perfil__custom-label">Textura</p>
                <div className="perfil__texture-opts">
                  {[["dots", "Pontos"], ["grid", "Grade"], ["diagonal", "Diagonal"]].map(([key, label]) => (
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
                <p className="perfil__custom-label">Estilo dos cards</p>
                <div className="perfil__style-opts">
                  {CARD_STYLES.map(s => (
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
                <p className="perfil__custom-label">Layout da galeria</p>
                <div className="perfil__layout-opts">
                  <button className={`perfil__layout-btn ${config.layout === "grid" ? "active" : ""}`} onClick={() => setConfig(p => ({ ...p, layout: "grid" }))}>
                    <GridIcon size={18} /> Grade 3
                  </button>
                  <button className={`perfil__layout-btn ${config.layout === "compact" ? "active" : ""}`} onClick={() => setConfig(p => ({ ...p, layout: "compact" }))}>
                    <GridIcon size={18} /> Grade 2
                  </button>
                  <button className={`perfil__layout-btn ${config.layout === "list" ? "active" : ""}`} onClick={() => setConfig(p => ({ ...p, layout: "list" }))}>
                    <ListIcon size={18} /> Lista
                  </button>
                </div>
              </section>
            </div>

            <div className="perfil__custom-footer">
              <button className="perfil__custom-save" onClick={() => salvarConfig(config)} disabled={salvandoConfig}>
                {salvandoConfig ? "Salvando..." : "Salvar personalização"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showModal && <CreatePostModal onClose={() => setShowModal(false)} onSuccess={carregarDados} />}
      {showCatalogoModal && <CatalogoModal onClose={() => setShowCatalogoModal(false)} />}
      {toast && <Toast mensagem={toast} visivel={!!toast} onFadeOut={() => setToast("")} />}

      <Footer />
    </div>
  );
}
