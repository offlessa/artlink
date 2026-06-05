import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/api";
import { HeartIcon, ImageOffIcon, BookmarkIcon, ShareIcon, VerificadoIcon, SendIcon, XIcon } from "./Icons";
import Toast from "./Toast";
import EditPostModal from "./EditPostModal";
import { copiarLink } from "../utils/compartilhar";
import { isVerificado } from "../utils/verificado";
import "../styles/components/PostCard.scss";

interface Usuario { id: number; nome: string; username: string; fotoPerfil?: string }

interface PostCardProps {
  id: number;
  titulo: string;
  descricao?: string;
  imagem?: string;
  tags?: string[];
  visualizacoes?: number;
  curtidas: { id: number; usuarioId: number }[];
  autor?: { id: number; nome: string; username: string; fotoPerfil?: string };
  onCurtidaChange?: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
}

export default function PostCard({ id, titulo, descricao, imagem, tags, visualizacoes, curtidas, autor, onCurtidaChange, onDelete, onEdit }: PostCardProps) {
  const navigate = useNavigate();
  const { usuario } = useAuth();

  const jaCurtiu = curtidas.some((c) => c.usuarioId === usuario?.id);
  const totalCurtidas = curtidas.length;
  const ehDono = usuario?.id === autor?.id;

  const [salvo, setSalvo] = useState(false);
  const [toast, setToast] = useState("");
  const [menuAberto, setMenuAberto] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [modalEnviar, setModalEnviar] = useState(false);
  const [busca, setBusca] = useState("");
  const [resultados, setResultados] = useState<Usuario[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!usuario) return;
    api.get(`/post-salvo/checar/${usuario.id}/${id}`)
      .then(r => setSalvo(r.data?.salvo ?? false))
      .catch(() => {});
  }, [usuario?.id, id]);

  useEffect(() => {
    function fechar(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuAberto(false);
    }
    document.addEventListener("mousedown", fechar);
    return () => document.removeEventListener("mousedown", fechar);
  }, []);

  async function toggleCurtida(e: React.MouseEvent) {
    e.stopPropagation();
    if (!usuario) return;
    try {
      if (jaCurtiu) {
        const curtida = curtidas.find((c) => c.usuarioId === usuario.id);
        if (curtida) await api.delete(`/curtida/${curtida.id}`);
      } else {
        await api.post("/curtida", { usuarioId: usuario.id, postId: id });
      }
      onCurtidaChange?.();
    } catch {}
  }

  async function toggleSalvar(e: React.MouseEvent) {
    e.stopPropagation();
    if (!usuario) { navigate("/login"); return; }
    try {
      if (salvo) {
        await api.delete(`/post-salvo/${usuario.id}/${id}`);
        setSalvo(false);
        mostrarToast("Removido dos salvos");
      } else {
        await api.post("/post-salvo", { usuarioId: usuario.id, postId: id });
        setSalvo(true);
        mostrarToast("Post salvo!");
      }
    } catch {}
  }

  function compartilhar(e: React.MouseEvent) {
    e.stopPropagation();
    copiarLink(`/post/${id}`, mostrarToast);
  }

  async function excluir(e: React.MouseEvent) {
    e.stopPropagation();
    setMenuAberto(false);
    if (!confirm("Excluir este post? Esta ação não pode ser desfeita.")) return;
    try {
      await api.delete(`/post/${id}`);
      onDelete?.();
    } catch { mostrarToast("Erro ao excluir post."); }
  }

  async function buscarUsuarios(q: string) {
    setBusca(q);
    if (!q.trim()) { setResultados([]); return; }
    setBuscando(true);
    try {
      const res = await api.get("/usuario");
      const todos: Usuario[] = res.data?.data ?? res.data ?? [];
      setResultados(
        todos.filter(u => u.id !== usuario?.id &&
          (u.nome.toLowerCase().includes(q.toLowerCase()) || u.username.toLowerCase().includes(q.toLowerCase()))
        ).slice(0, 6)
      );
    } catch { setResultados([]); }
    finally { setBuscando(false); }
  }

  async function enviarPara(dest: Usuario) {
    if (!usuario || enviando) return;
    setEnviando(true);
    const url = `${import.meta.env.VITE_APP_URL}/post/${id}`;
    try {
      await api.post("/mensagem", {
        remetenteId: usuario.id,
        destinatarioId: dest.id,
        conteudo: `Olha esse post: ${url}`,
      });
      mostrarToast(`Post enviado para @${dest.username}!`);
      setModalEnviar(false);
      setBusca("");
      setResultados([]);
    } catch { mostrarToast("Erro ao enviar."); }
    finally { setEnviando(false); }
  }

  function mostrarToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  }

  const inicialAutor = autor?.nome?.charAt(0).toUpperCase() ?? "?";

  return (
    <>
      <article className="post-card" onClick={() => navigate(`/post/${id}`)}>
        {/* Menu do dono (⋮) */}
        {ehDono && (
          <div className="post-card__menu-wrap" ref={menuRef} onClick={e => e.stopPropagation()}>
            <button
              className="post-card__menu-btn"
              onClick={e => { e.stopPropagation(); setMenuAberto(v => !v); }}
              title="Opções"
            >⋮</button>
            {menuAberto && (
              <div className="post-card__menu-dropdown">
                <button onClick={e => { e.stopPropagation(); setMenuAberto(false); setModalEditar(true); }}>Editar post</button>
                <button className="post-card__menu-excluir" onClick={excluir}>Excluir post</button>
              </div>
            )}
          </div>
        )}

        <div className="post-card__top">
          <h2 className="post-card__titulo">{titulo}</h2>
          {autor && (
            <p className="post-card__subtitulo">
              {descricao ? descricao : `por ${autor.nome}`}
            </p>
          )}
        </div>

        <div className="post-card__image-wrapper">
          {imagem
            ? <img src={imagem} alt={titulo} loading="lazy" />
            : <div className="post-card__no-image"><ImageOffIcon size={36} /></div>
          }
        </div>

        {tags && tags.length > 0 && (
          <div className="post-card__tags">
            {tags.slice(0, 3).map(t => (
              <span key={t} className="post-card__tag" onClick={e => e.stopPropagation()}>#{t}</span>
            ))}
          </div>
        )}

        <div className="post-card__bottom">
          <button
            className={`post-card__like ${jaCurtiu ? "post-card__like--ativo" : ""}`}
            onClick={toggleCurtida}
            title={jaCurtiu ? "Descurtir" : "Curtir"}
          >
            <HeartIcon size={13} filled={jaCurtiu} />
            <span>{totalCurtidas}</span>
          </button>

          <div className="post-card__acoes">
            <button
              className={`post-card__icon-btn ${salvo ? "post-card__icon-btn--ativo" : ""}`}
              onClick={toggleSalvar}
              title={salvo ? "Remover dos salvos" : "Salvar"}
            >
              <BookmarkIcon size={13} filled={salvo} />
            </button>
            <button
              className="post-card__icon-btn"
              onClick={e => { e.stopPropagation(); if (!usuario) { navigate("/login"); return; } setModalEnviar(true); }}
              title="Enviar para alguém"
            >
              <SendIcon size={13} />
            </button>
            <button
              className="post-card__icon-btn"
              onClick={compartilhar}
              title="Copiar link"
            >
              <ShareIcon size={13} />
            </button>
          </div>

          <div className="post-card__autor">
            <div className="post-card__avatar">
              {autor?.fotoPerfil
                ? <img src={autor.fotoPerfil} alt={autor.nome} />
                : <span>{inicialAutor}</span>
              }
            </div>
            <span>{autor?.username}</span>
            {isVerificado(autor?.username) && <VerificadoIcon size={13} />}
            {visualizacoes !== undefined && visualizacoes > 0 && (
              <span className="post-card__views">{visualizacoes} {visualizacoes === 1 ? "view" : "views"}</span>
            )}
          </div>
        </div>
      </article>

      {modalEditar && (
        <EditPostModal
          id={id}
          tituloInicial={titulo}
          descricaoInicial={descricao}
          tagsIniciais={tags}
          onClose={() => setModalEditar(false)}
          onSuccess={() => { onEdit?.(); onCurtidaChange?.(); }}
        />
      )}

      {/* Modal enviar */}
      {modalEnviar && (
        <div className="post-card__enviar-overlay" onClick={() => setModalEnviar(false)}>
          <div className="post-card__enviar-modal" onClick={e => e.stopPropagation()}>
            <div className="post-card__enviar-header">
              <span>Enviar post</span>
              <button onClick={() => setModalEnviar(false)}><XIcon size={16} /></button>
            </div>
            <input
              className="post-card__enviar-busca"
              type="text"
              placeholder="Buscar pessoa..."
              value={busca}
              onChange={e => buscarUsuarios(e.target.value)}
              autoFocus
            />
            <div className="post-card__enviar-lista">
              {buscando && <p className="post-card__enviar-hint">Buscando...</p>}
              {!buscando && busca && resultados.length === 0 && (
                <p className="post-card__enviar-hint">Nenhum usuário encontrado.</p>
              )}
              {!busca && <p className="post-card__enviar-hint">Digite o nome ou @ de alguém.</p>}
              {resultados.map(u => (
                <button key={u.id} className="post-card__enviar-item" onClick={() => enviarPara(u)} disabled={enviando}>
                  <div className="post-card__enviar-avatar">
                    {u.fotoPerfil ? <img src={u.fotoPerfil} alt={u.nome} /> : <span>{u.nome.charAt(0).toUpperCase()}</span>}
                  </div>
                  <div>
                    <p className="post-card__enviar-nome">{u.nome}</p>
                    <p className="post-card__enviar-user">@{u.username}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {toast && <Toast mensagem={toast} visivel={!!toast} onFadeOut={() => setToast("")} />}
    </>
  );
}
