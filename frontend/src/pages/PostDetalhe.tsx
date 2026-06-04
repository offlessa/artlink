import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api/api";
import { useAuth } from "../context/AuthContext";
import Footer from "../components/Footer";
import Toast from "../components/Toast";
import { HeartIcon, ImageOffIcon, TrashIcon, EyeOffIcon, EyeIcon, BookmarkIcon, ShareIcon } from "../components/Icons";
import { copiarLink } from "../utils/compartilhar";
import "../styles/components/PostDetalhe.scss";

interface Comentario {
  id: number;
  conteudo: string;
  data: string;
  oculto: boolean;
  usuario: { id: number; nome: string; username: string; fotoPerfil?: string };
}

interface Colaboracao {
  usuarioId: number;
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
  colaboracoes: Colaboracao[];
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
  const [acaoComentario, setAcaoComentario] = useState<number | null>(null);
  const [verOcultos, setVerOcultos] = useState(false);
  const [salvo, setSalvo] = useState(false);
  const [toast, setToast] = useState("");

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

  useEffect(() => {
    if (!usuario || !id) return;
    api.get(`/post-salvo/checar/${usuario.id}/${id}`)
      .then(r => setSalvo(r.data?.salvo ?? false))
      .catch(() => {});
  }, [usuario?.id, id]);

  if (carregando) return <div className="post-detalhe__loading">Carregando...</div>;
  if (!post) return null;

  const jaCurtiu = post.curtidas.some((c) => c.usuarioId === usuario?.id);
  const totalCurtidas = post.curtidas.length;

  // Gestor = dono do post OU colaborador
  const isGestor = !!usuario && (
    usuario.id === post.autor.id ||
    post.colaboracoes.some(c => c.usuarioId === usuario.id)
  );

  const visiveis = comentarios.filter(c => !c.oculto);
  const ocultos  = comentarios.filter(c => c.oculto);

  function mostrarToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  }

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
    } catch {}
  }

  async function toggleSalvar() {
    if (!post || !usuario) { navigate("/login"); return; }
    try {
      if (salvo) {
        await api.delete(`/post-salvo/${usuario.id}/${post.id}`);
        setSalvo(false);
        mostrarToast("Removido dos salvos");
      } else {
        await api.post("/post-salvo", { usuarioId: usuario.id, postId: post.id });
        setSalvo(true);
        mostrarToast("Post salvo!");
      }
    } catch {}
  }

  function compartilhar() {
    copiarLink(`/post/${id}`, mostrarToast);
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
    } finally {
      setEnviando(false);
    }
  }

  async function excluirComentario(comentarioId: number) {
    setAcaoComentario(comentarioId);
    try {
      await api.delete(`/comentario/${comentarioId}`);
      carregarPost();
    } finally {
      setAcaoComentario(null);
    }
  }

  async function toggleOculto(c: Comentario) {
    setAcaoComentario(c.id);
    try {
      await api.put(`/comentario/${c.id}`, { oculto: !c.oculto });
      carregarPost();
    } finally {
      setAcaoComentario(null);
    }
  }

  const inicialAutor = post.autor.nome.charAt(0).toUpperCase();

  function ComentarioItem({ c, ocultoView = false }: { c: Comentario; ocultoView?: boolean }) {
    const isMeu = usuario?.id === c.usuario.id;
    const emAcao = acaoComentario === c.id;

    return (
      <div className={`post-detalhe__comentario ${ocultoView ? "post-detalhe__comentario--oculto-view" : ""}`}>
        <div className="post-detalhe__avatar-sm">
          {c.usuario.fotoPerfil
            ? <img src={c.usuario.fotoPerfil} alt={c.usuario.nome} />
            : <span>{c.usuario.nome.charAt(0).toUpperCase()}</span>}
        </div>
        <div className="post-detalhe__comentario-body">
          <div className="post-detalhe__comentario-header">
            <span className="post-detalhe__comentario-autor">{c.usuario.nome}</span>
            <div className="post-detalhe__comentario-acoes">
              {isGestor && !ocultoView && (
                <button
                  className="post-detalhe__acao-btn"
                  onClick={() => toggleOculto(c)}
                  disabled={emAcao}
                  title="Ocultar comentário"
                >
                  <EyeOffIcon size={13} />
                </button>
              )}
              {isGestor && ocultoView && (
                <button
                  className="post-detalhe__acao-btn post-detalhe__acao-btn--mostrar"
                  onClick={() => toggleOculto(c)}
                  disabled={emAcao}
                  title="Mostrar comentário"
                >
                  <EyeIcon size={13} /> <span>Mostrar</span>
                </button>
              )}
              {isMeu && (
                <button
                  className="post-detalhe__acao-btn post-detalhe__acao-btn--del"
                  onClick={() => excluirComentario(c.id)}
                  disabled={emAcao}
                  title="Excluir comentário"
                >
                  <TrashIcon size={13} />
                </button>
              )}
            </div>
          </div>
          <p className="post-detalhe__comentario-texto">{c.conteudo}</p>
        </div>
      </div>
    );
  }

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
                  : <span>{inicialAutor}</span>}
              </div>
              <div className="post-detalhe__autor-info">
                <span className="post-detalhe__autor-nome">{post.autor.nome}</span>
                <span className="post-detalhe__autor-user">@{post.autor.username}</span>
              </div>
            </div>
            <div className="post-detalhe__acoes">
              <button
                className={`post-detalhe__curtir ${jaCurtiu ? "post-detalhe__curtir--ativo" : ""}`}
                onClick={toggleCurtida}
              >
                <HeartIcon size={15} filled={jaCurtiu} />
                {totalCurtidas}
              </button>
              <button
                className={`post-detalhe__icon-btn ${salvo ? "post-detalhe__icon-btn--ativo" : ""}`}
                onClick={toggleSalvar}
                title={salvo ? "Remover dos salvos" : "Salvar"}
              >
                <BookmarkIcon size={16} filled={salvo} />
              </button>
              <button
                className="post-detalhe__icon-btn"
                onClick={compartilhar}
                title="Compartilhar"
              >
                <ShareIcon size={16} />
              </button>
            </div>
          </div>
          {post.descricao && <p className="post-detalhe__descricao">{post.descricao}</p>}

          {post.colaboracoes.length > 0 && (
            <div className="post-detalhe__collabs">
              <span className="post-detalhe__collabs-label">Com colaboração de</span>
              <div className="post-detalhe__collabs-list">
                {post.colaboracoes.map(col => (
                  <div key={col.usuarioId} className="post-detalhe__collab-chip">
                    <div className="post-detalhe__collab-av">
                      {col.usuario.fotoPerfil
                        ? <img src={col.usuario.fotoPerfil} alt={col.usuario.nome} />
                        : <span>{col.usuario.nome.charAt(0)}</span>}
                    </div>
                    <span>@{col.usuario.username}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="post-detalhe__comentarios-col">
          <h1 className="post-detalhe__titulo">{post.titulo}</h1>
          <p className="post-detalhe__secao-titulo">
            {visiveis.length} Comentário{visiveis.length !== 1 ? "s" : ""}
          </p>

          <div className="post-detalhe__lista">
            {visiveis.length === 0
              ? <p className="post-detalhe__sem-comentarios">Seja o primeiro a comentar.</p>
              : visiveis.map(c => <ComentarioItem key={c.id} c={c} />)
            }
          </div>

          {/* Comentários ocultos — só gestores veem */}
          {isGestor && ocultos.length > 0 && (
            <div className="post-detalhe__ocultos">
              <button
                className="post-detalhe__ocultos-toggle"
                onClick={() => setVerOcultos(v => !v)}
              >
                <EyeOffIcon size={14} />
                {verOcultos ? "Ocultar" : `Ver comentários ocultos (${ocultos.length})`}
                <span className={`post-detalhe__ocultos-chevron ${verOcultos ? "open" : ""}`}>▾</span>
              </button>

              {verOcultos && (
                <div className="post-detalhe__ocultos-lista">
                  {ocultos.map(c => <ComentarioItem key={c.id} c={c} ocultoView />)}
                </div>
              )}
            </div>
          )}

          {usuario ? (
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
          ) : (
            <p className="post-detalhe__sem-comentarios" style={{ marginTop: 8 }}>
              <a href="/login" style={{ color: "#2A3B1C", fontWeight: 600 }}>Entre</a> para comentar.
            </p>
          )}
        </div>

      </div>
      <Footer />
      {toast && <Toast mensagem={toast} visivel={!!toast} onFadeOut={() => setToast("")} />}
    </div>
  );
}
