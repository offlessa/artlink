import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/api";
import { useAuth } from "../context/AuthContext";
import Footer from "../components/Footer";
import { HeartIcon, CommentIcon, FolderIcon } from "../components/Icons";
import "../styles/components/Perfil.scss";

interface Post {
  id: number;
  titulo: string;
  imagem?: string;
  curtidas: { id: number }[];
  comentarios: { id: number }[];
}

interface Catalogo {
  id: number;
  nome: string;
  posts: { postId: number }[];
}

export default function Perfil() {
  const { usuario } = useAuth();
  const navigate = useNavigate();

  const [posts, setPosts] = useState<Post[]>([]);
  const [catalogos, setCatalogos] = useState<Catalogo[]>([]);
  const [carregando, setCarregando] = useState(true);

  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [imagemUrl, setImagemUrl] = useState("");
  const [criando, setCriando] = useState(false);
  const [msgPost, setMsgPost] = useState("");

  async function carregarDados() {
    if (!usuario) return;
    try {
      const [resPosts, resCatalogos] = await Promise.all([
        api.get(`/post/usuario/${usuario.id}`),
        api.get(`/catalogo/usuario/${usuario.id}`),
      ]);
      setPosts(Array.isArray(resPosts.data) ? resPosts.data : []);
      setCatalogos(Array.isArray(resCatalogos.data) ? resCatalogos.data : []);
    } catch (err) {
      console.error("Erro ao carregar perfil:", err);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => { carregarDados(); }, [usuario?.id]);

  async function criarPost(e: React.FormEvent) {
    e.preventDefault();
    if (!titulo.trim() || !usuario) return;
    setCriando(true);
    setMsgPost("");
    try {
      await api.post("/post", {
        usuarioId: usuario.id,
        titulo: titulo.trim(),
        descricao: descricao.trim() || null,
        imagem: imagemUrl.trim() || null,
      });
      setTitulo("");
      setDescricao("");
      setImagemUrl("");
      setMsgPost("Publicação criada!");
      carregarDados();
    } catch {
      setMsgPost("Erro ao criar publicação.");
    } finally {
      setCriando(false);
    }
  }

  const inicial = usuario?.nome?.charAt(0).toUpperCase() ?? "?";

  return (
    <div className="perfil">
      {/* Hero */}
      <div className="perfil__hero">
        <div className="perfil__avatar">
          {usuario?.fotoPerfil
            ? <img src={usuario.fotoPerfil} alt={usuario.nome} />
            : <span>{inicial}</span>
          }
        </div>
        <div className="perfil__hero-info">
          <h1 className="perfil__nome">{usuario?.nome}</h1>
          <span className="perfil__username">@{usuario?.username}</span>
          <div className="perfil__stats">
            <div className="perfil__stat">
              <strong>{posts.length}</strong>
              <span>Posts</span>
            </div>
            <div className="perfil__stat">
              <strong>{catalogos.length}</strong>
              <span>Catálogos</span>
            </div>
          </div>
        </div>
      </div>

      <div className="perfil__body">
        {/* Sidebar: criar post */}
        <aside className="perfil__sidebar">
          <button className="perfil__btn-artistas">Adicionar Artistas</button>

          <div className="perfil__criar-card">
            <p className="perfil__criar-titulo">Compartilhe sua arte</p>
            <form onSubmit={criarPost}>
              <div className="perfil__upload-area">
                {imagemUrl
                  ? <img src={imagemUrl} alt="preview" />
                  : <span className="perfil__upload-plus">+</span>
                }
              </div>
              <input
                className="perfil__input"
                type="text"
                placeholder="URL da imagem (opcional)"
                value={imagemUrl}
                onChange={(e) => setImagemUrl(e.target.value)}
              />
              <input
                className="perfil__input"
                type="text"
                placeholder="Título *"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                required
              />
              <input
                className="perfil__input"
                type="text"
                placeholder="Descrição (opcional)"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
              />
              {msgPost && (
                <p className={`perfil__msg ${msgPost.includes("Erro") ? "perfil__msg--erro" : "perfil__msg--ok"}`}>
                  {msgPost}
                </p>
              )}
              <button className="perfil__btn-criar" type="submit" disabled={criando || !titulo.trim()}>
                {criando ? "Publicando..." : "Criar publicação"}
              </button>
            </form>
          </div>
        </aside>

        {/* Galeria */}
        <main className="perfil__galeria">
          {catalogos.length > 0 && (
            <>
              <div className="perfil__galeria-header">
                <h2 className="perfil__galeria-titulo">Catálogos</h2>
                <span className="perfil__galeria-count">{catalogos.length}</span>
              </div>
              <div className="perfil__grid">
                {catalogos.map((cat) => (
                  <div key={cat.id} className="perfil__catalogo-card">
                    <div className="perfil__catalogo-label">{cat.nome}</div>
                    <div className="perfil__catalogo-capa">
                      <FolderIcon size={28} />
                      <span>{cat.posts.length} item{cat.posts.length !== 1 ? "s" : ""}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          <div className="perfil__galeria-header">
            <h2 className="perfil__galeria-titulo">Sua Galeria</h2>
            <span className="perfil__galeria-count">{posts.length} publicações</span>
          </div>

          {carregando ? (
            <p className="perfil__status">Carregando...</p>
          ) : posts.length === 0 ? (
            <div className="perfil__empty">
              <p>Você ainda não publicou nada. Compartilhe sua arte!</p>
            </div>
          ) : (
            <div className="perfil__grid">
              {posts.map((post) => (
                <div key={post.id} className="perfil__post-card" onClick={() => navigate(`/post/${post.id}`)}>
                  <div className="perfil__post-label">{post.titulo}</div>
                  {post.imagem
                    ? <img className="perfil__post-imagem" src={post.imagem} alt={post.titulo} />
                    : <div className="perfil__post-sem-img">Sem imagem</div>
                  }
                  <div className="perfil__post-stats">
                    <span><HeartIcon size={12} filled /> {post.curtidas.length}</span>
                    <span><CommentIcon size={12} /> {post.comentarios.length}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}
