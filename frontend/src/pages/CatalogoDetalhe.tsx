import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api/api";
import { uploadImagem } from "../api/upload";
import { useAuth } from "../context/AuthContext";
import Footer from "../components/Footer";
import CreatePostModal from "../components/CreatePostModal";
import {
  ChevronRightIcon, HeartIcon, CommentIcon,
  ImageOffIcon, PlusIcon, TrashIcon, XIcon, CameraIcon, SearchIcon,
} from "../components/Icons";
import "../styles/components/CatalogoDetalhe.scss";

interface Post {
  id: number;
  titulo: string;
  imagem?: string;
  curtidas: { id: number }[];
  comentarios: { id: number }[];
  autor: { id: number; nome: string; username: string };
}

interface Imagem {
  id: number;
  imagem: string;
  dataCriacao: string;
}

interface Catalogo {
  id: number;
  nome: string;
  descricao?: string;
  capa?: string;
  usuarioId: number;
  dono: { id: number; nome: string; username: string; fotoPerfil?: string };
}

export default function CatalogoDetalhe() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const capaRef = useRef<HTMLInputElement>(null);
  const fotosRef = useRef<HTMLInputElement>(null);

  const [catalogo, setCatalogo] = useState<Catalogo | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [imagens, setImagens] = useState<Imagem[]>([]);
  const [carregando, setCarregando] = useState(true);

  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [showNewPost, setShowNewPost] = useState(false);

  const [todosPosts, setTodosPosts] = useState<Post[]>([]);
  const [buscaPicker, setBuscaPicker] = useState("");
  const [adicionando, setAdicionando] = useState<number | null>(null);
  const [removendo, setRemovendo] = useState<number | null>(null);
  const [removendoImagem, setRemovendoImagem] = useState<number | null>(null);
  const [salvandoCapa, setSalvandoCapa] = useState(false);
  const [uploadandoFotos, setUploadandoFotos] = useState(false);

  async function carregar() {
    try {
      const resCat = await api.get(`/catalogo/${id}`);
      setCatalogo(resCat.data);
    } catch {
      navigate("/perfil");
      return;
    }
    try {
      const [resPosts, resImagens] = await Promise.all([
        api.get(`/catalogo/post/${id}`),
        api.get(`/catalogo/imagem/${id}`),
      ]);
      setPosts(Array.isArray(resPosts.data) ? resPosts.data : []);
      setImagens(Array.isArray(resImagens.data) ? resImagens.data : []);
    } catch {
      setPosts([]);
      setImagens([]);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => { carregar(); }, [id]);

  async function removerPost(e: React.MouseEvent, postId: number) {
    e.stopPropagation();
    setRemovendo(postId);
    try {
      await api.delete(`/catalogo/post/${id}/${postId}`);
      setPosts(p => p.filter(x => x.id !== postId));
    } finally { setRemovendo(null); }
  }

  async function removerImagem(e: React.MouseEvent, imagemId: number) {
    e.stopPropagation();
    setRemovendoImagem(imagemId);
    try {
      await api.delete(`/catalogo/imagem/${imagemId}`);
      setImagens(imgs => imgs.filter(x => x.id !== imagemId));
    } finally { setRemovendoImagem(null); }
  }

  async function abrirPicker() {
    setShowAddMenu(false);
    setBuscaPicker("");
    const res = await api.get("/post");
    setTodosPosts(Array.isArray(res.data) ? res.data : []);
    setShowPicker(true);
  }

  async function adicionarPost(postId: number) {
    setAdicionando(postId);
    try {
      await api.post("/catalogo/post", { catalogoId: Number(id), postId });
      const res = await api.get(`/catalogo/post/${id}`);
      setPosts(Array.isArray(res.data) ? res.data : []);
    } finally { setAdicionando(null); }
  }

  async function uploadCapa(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !catalogo) return;
    e.target.value = "";
    setSalvandoCapa(true);
    try {
      const url = await uploadImagem(file);
      await api.put(`/catalogo/${catalogo.id}`, { capa: url });
      setCatalogo(c => c ? { ...c, capa: url } : c);
    } catch {
      alert("Erro ao salvar a capa.");
    } finally {
      setSalvandoCapa(false);
    }
  }

  async function uploadFotos(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length || !catalogo) return;
    e.target.value = "";
    setUploadandoFotos(true);
    try {
      const novas: Imagem[] = [];
      for (const file of files) {
        try {
          const url = await uploadImagem(file);
          const res = await api.post("/catalogo/imagem", {
            catalogoId: catalogo.id,
            imagem: url,
          });
          novas.push(res.data);
        } catch {
          // pula foto com erro e continua as demais
        }
      }
      if (novas.length) setImagens(imgs => [...imgs, ...novas]);
    } finally {
      setUploadandoFotos(false);
    }
  }

  if (carregando) return <div className="cat-det__loading">Carregando...</div>;
  if (!catalogo) return null;

  const isDono = usuario?.id === catalogo.usuarioId;
  const idsNoCatalogo = new Set(posts.map(p => p.id));

  const postsFiltrados = todosPosts.filter(p => {
    if (idsNoCatalogo.has(p.id)) return false;
    if (!buscaPicker.trim()) return true;
    const q = buscaPicker.toLowerCase();
    return (
      p.titulo.toLowerCase().includes(q) ||
      p.autor.username.toLowerCase().includes(q) ||
      p.autor.nome.toLowerCase().includes(q)
    );
  });

  return (
    <div className="cat-det">

      {/* ── CAPA ──────────────────────────────────────────────── */}
      <div className="cat-det__capa">
        {catalogo.capa
          ? <img src={catalogo.capa} alt={catalogo.nome} />
          : <div className="cat-det__capa-placeholder" />}
        {isDono && (
          <>
            <button
              className="cat-det__capa-btn"
              onClick={() => capaRef.current?.click()}
              disabled={salvandoCapa}
            >
              <CameraIcon size={14} />
              {salvandoCapa ? "Salvando..." : catalogo.capa ? "Mudar capa" : "Adicionar capa"}
            </button>
            <input ref={capaRef} type="file" accept="image/*" hidden onChange={uploadCapa} />
          </>
        )}
      </div>

      <div className="cat-det__container">
        <button className="cat-det__back" onClick={() => navigate("/perfil")}>
          <ChevronRightIcon size={13} className="cat-det__back-icon" />
          Voltar ao perfil
        </button>

        {/* ── HEADER ─────────────────────────────────────────── */}
        <div className="cat-det__header">
          <div className="cat-det__header-info">
            <h1 className="cat-det__titulo">{catalogo.nome}</h1>
            {catalogo.descricao && <p className="cat-det__desc">{catalogo.descricao}</p>}
            <p className="cat-det__meta">
              por @{catalogo.dono.username} · {posts.length} publicaç{posts.length !== 1 ? "ões" : "ão"}
              {imagens.length > 0 && ` · ${imagens.length} foto${imagens.length !== 1 ? "s" : ""}`}
            </p>
          </div>

          {isDono && (
            <div className="cat-det__add-wrap">
              <button
                className="cat-det__add-btn"
                onClick={() => setShowAddMenu(v => !v)}
              >
                <PlusIcon size={14} /> Adicionar
              </button>
              {showAddMenu && (
                <>
                  <div className="cat-det__add-backdrop" onClick={() => setShowAddMenu(false)} />
                  <div className="cat-det__add-menu">
                    <button onClick={() => { setShowAddMenu(false); fotosRef.current?.click(); }}>
                      Fotos diretas
                    </button>
                    <button onClick={() => { setShowAddMenu(false); setShowNewPost(true); }}>
                      Nova publicação
                    </button>
                    <button onClick={abrirPicker}>
                      Buscar publicações
                    </button>
                  </div>
                </>
              )}
              <input
                ref={fotosRef}
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={uploadFotos}
              />
            </div>
          )}
        </div>

        {/* ── GALERIA DE FOTOS DIRETAS ───────────────────────── */}
        {(imagens.length > 0 || uploadandoFotos) && (
          <div className="cat-det__fotos-section">
            <p className="cat-det__section-label">
              Fotos
              {uploadandoFotos && <span className="cat-det__uploading"> Enviando...</span>}
            </p>
            <div className="cat-det__fotos-grid">
              {imagens.map(img => (
                <div key={img.id} className="cat-det__foto">
                  <img src={img.imagem} alt="" />
                  {isDono && (
                    <button
                      className="cat-det__foto-del"
                      onClick={e => removerImagem(e, img.id)}
                      disabled={removendoImagem === img.id}
                      title="Remover foto"
                    >
                      <TrashIcon size={12} />
                    </button>
                  )}
                </div>
              ))}
              {uploadandoFotos && (
                <div className="cat-det__foto cat-det__foto--loading">
                  <span>Enviando...</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── PUBLICAÇÕES (POSTS) ────────────────────────────── */}
        {posts.length > 0 && (
          <p className="cat-det__section-label" style={{ marginTop: imagens.length > 0 ? "2rem" : 0 }}>
            Publicações
          </p>
        )}

        {posts.length === 0 && imagens.length === 0 ? (
          <div className="cat-det__empty">
            <p>Este catálogo ainda não tem nada.</p>
            {isDono && (
              <div className="cat-det__empty-actions">
                <button className="cat-det__empty-btn" onClick={() => fotosRef.current?.click()}>
                  <PlusIcon size={14} /> Adicionar fotos
                </button>
                <button className="cat-det__empty-btn cat-det__empty-btn--outline" onClick={abrirPicker}>
                  <PlusIcon size={14} /> Buscar publicações
                </button>
              </div>
            )}
          </div>
        ) : posts.length > 0 ? (
          <div className="cat-det__grid">
            {posts.map(post => (
              <div key={post.id} className="cat-det__card" onClick={() => navigate(`/post/${post.id}`)}>
                <div className="cat-det__card-img">
                  {post.imagem
                    ? <img src={post.imagem} alt={post.titulo} />
                    : <div className="cat-det__no-img"><ImageOffIcon size={24} /></div>}
                </div>
                <div className="cat-det__card-info">
                  <span className="cat-det__card-titulo">{post.titulo}</span>
                  <div className="cat-det__card-row">
                    <span className="cat-det__card-stats">
                      <HeartIcon size={11} filled /> {post.curtidas.length}
                      &nbsp;&nbsp;<CommentIcon size={11} /> {post.comentarios.length}
                    </span>
                    {isDono && (
                      <button
                        className="cat-det__card-del"
                        onClick={e => removerPost(e, post.id)}
                        disabled={removendo === post.id}
                        title="Remover do catálogo"
                      >
                        <TrashIcon size={13} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      {/* ── PICKER MODAL ──────────────────────────────────────── */}
      {showPicker && (
        <div className="cat-det__picker-overlay" onClick={e => { if (e.target === e.currentTarget) setShowPicker(false); }}>
          <div className="cat-det__picker">
            <div className="cat-det__picker-header">
              <span>Adicionar publicação</span>
              <button onClick={() => setShowPicker(false)}><XIcon size={18} /></button>
            </div>
            <div className="cat-det__picker-search">
              <SearchIcon size={15} />
              <input
                type="text"
                placeholder="Buscar por título ou artista..."
                value={buscaPicker}
                onChange={e => setBuscaPicker(e.target.value)}
                autoFocus
              />
            </div>
            {postsFiltrados.length === 0 ? (
              <p className="cat-det__picker-empty">
                {idsNoCatalogo.size === todosPosts.length
                  ? "Todas as publicações já estão neste catálogo."
                  : "Nenhuma publicação encontrada."}
              </p>
            ) : (
              <div className="cat-det__picker-grid">
                {postsFiltrados.map(post => (
                  <button
                    key={post.id}
                    className={`cat-det__picker-item ${adicionando === post.id ? "cat-det__picker-item--adding" : ""}`}
                    onClick={() => adicionarPost(post.id)}
                    disabled={adicionando === post.id}
                  >
                    <div className="cat-det__picker-img">
                      {post.imagem
                        ? <img src={post.imagem} alt={post.titulo} />
                        : <div className="cat-det__picker-noimg"><ImageOffIcon size={20} /></div>}
                      {adicionando === post.id && (
                        <div className="cat-det__picker-adding">+</div>
                      )}
                    </div>
                    <span className="cat-det__picker-title">{post.titulo}</span>
                    <span className="cat-det__picker-author">@{post.autor.username}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {showNewPost && (
        <CreatePostModal
          catalogoId={Number(id)}
          onClose={() => setShowNewPost(false)}
          onSuccess={carregar}
        />
      )}

      <Footer />
    </div>
  );
}
