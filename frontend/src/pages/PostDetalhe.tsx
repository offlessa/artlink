import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api/api";
import { useAuth } from "../context/AuthContext";
import Footer from "../components/Footer";
import { HeartIcon, ImageOffIcon } from "../components/Icons";
import "../styles/components/PostDetalhe.scss";

interface Comentario {
  id: number;
  conteudo: string;
  data: string;
  usuario: { id: number; nome: string; username: string; fotoPerfil?: string };
}

interface Post {
  id: number;
  titulo: string;
  descricao?: string;
  imagem?: string;
  curtidas: { id: number; usuarioId: number }[];
  comentarios: Comentario[];
  autor: { id: number; nome: string; username: string; fotoPerfil?: string };
}

export default function PostDetalhe() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { usuario } = useAuth();

  const [post, setPost] = useState<Post | null>(null);
  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const [novoComentario, setNovoComentario] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);

  async function carregarPost() {
    try {
      const [resPost, resComentarios] = await Promise.all([
        api.get(`/post/${id}`),
        api.get(`/comentario/${id}`).catch(() => ({ data: [] })),
      ]);
      setPost(resPost.data);
      setComentarios(Array.isArray(resComentarios.data) ? resComentarios.data : []);
    } catch {
      navigate("/");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => { carregarPost(); }, [id]);

  const jaCurtiu = post?.curtidas.some((c) => c.usuarioId === usuario?.id) ?? false;
  const totalCurtidas = post?.curtidas.length ?? 0;

  async function toggleCurtida() {
    if (!post || !usuario) return;
    try {
      if (jaCurtiu) {
        const curtida = post.curtidas.find((c) => c.usuarioId === usuario.id);
        if (curtida) await api.delete(`/curtida/${curtida.id}`);
      } else {
        await api.post("/curtida", { usuarioId: usuario.id, postId: post.id });
      }
      carregarPost();
    } catch (err) {
      console.error("Erro ao curtir:", err);
    }
  }

  async function enviarComentario(e: React.FormEvent) {
    e.preventDefault();
    if (!novoComentario.trim() || !usuario || !post) return;
    setEnviando(true);
    try {
      await api.post("/comentario", {
        usuarioId: usuario.id,
        postId: post.id,
        conteudo: novoComentario.trim(),
      });
      setNovoComentario("");
      carregarPost();
    } catch (err) {
      console.error("Erro ao comentar:", err);
    } finally {
      setEnviando(false);
    }
  }

  if (carregando) return <div className="post-detalhe__loading">Carregando...</div>;
  if (!post) return null;

  const inicialAutor = post.autor.nome.charAt(0).toUpperCase();

  return (
    <div className="post-detalhe">
      <div className="post-detalhe__container">

        <div className="post-detalhe__imagem-col">
          <p className="post-detalhe__breadcrumb">
            Arte / <span>{post.titulo}</span>
          </p>
          <div className="post-detalhe__imagem-wrapper">
            {post.imagem
              ? <img src={post.imagem} alt={post.titulo} />
              : <div className="post-detalhe__sem-imagem">
                  <ImageOffIcon size={40} />
                  <span>Sem imagem</span>
                </div>
            }
          </div>
          <div className="post-detalhe__meta">
            <div className="post-detalhe__autor-row">
              <div className="post-detalhe__avatar">
                {post.autor.fotoPerfil
                  ? <img src={post.autor.fotoPerfil} alt={post.autor.nome} />
                  : <span>{inicialAutor}</span>
                }
              </div>
              <div className="post-detalhe__autor-info">
                <span className="post-detalhe__autor-nome">{post.autor.nome}</span>
                <span className="post-detalhe__autor-user">@{post.autor.username}</span>
              </div>
            </div>
            <button
              className={`post-detalhe__curtir ${jaCurtiu ? "post-detalhe__curtir--ativo" : ""}`}
              onClick={toggleCurtida}
            >
              <HeartIcon size={15} filled={jaCurtiu} />
              {totalCurtidas}
            </button>
          </div>
          {post.descricao && (
            <p className="post-detalhe__descricao">{post.descricao}</p>
          )}
        </div>

        <div className="post-detalhe__comentarios-col">
          <h1 className="post-detalhe__titulo">{post.titulo}</h1>
          <p className="post-detalhe__secao-titulo">
            {comentarios.length} Comentário{comentarios.length !== 1 ? "s" : ""}
          </p>

          <div className="post-detalhe__lista">
            {comentarios.length === 0
              ? <p className="post-detalhe__sem-comentarios">
                  Seja o primeiro a comentar.
                </p>
              : comentarios.map((c) => (
                  <div key={c.id} className="post-detalhe__comentario">
                    <div className="post-detalhe__avatar-sm">
                      {c.usuario.fotoPerfil
                        ? <img src={c.usuario.fotoPerfil} alt={c.usuario.nome} />
                        : <span>{c.usuario.nome.charAt(0).toUpperCase()}</span>
                      }
                    </div>
                    <div className="post-detalhe__comentario-body">
                      <span className="post-detalhe__comentario-autor">{c.usuario.nome}</span>
                      <p className="post-detalhe__comentario-texto">{c.conteudo}</p>
                    </div>
                  </div>
                ))
            }
          </div>

          <form className="post-detalhe__form" onSubmit={enviarComentario}>
            <input
              type="text"
              placeholder="Escreva um comentário..."
              value={novoComentario}
              onChange={(e) => setNovoComentario(e.target.value)}
            />
            <button type="submit" disabled={enviando || !novoComentario.trim()}>
              {enviando ? "..." : "Enviar"}
            </button>
          </form>
        </div>

      </div>
      <Footer />
    </div>
  );
}
