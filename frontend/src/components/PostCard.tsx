import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/api";
import { HeartIcon, ImageOffIcon, BookmarkIcon, ShareIcon, VerificadoIcon, PlayIcon } from "./Icons";
import Toast from "./Toast";
import EditPostModal from "./EditPostModal";
import ShareModal from "./ShareModal";
import { isVerificado } from "../utils/verificado";
import { isVideo } from "../utils/midia";
import "../styles/components/PostCard.scss";

interface PostCardProps {
  id: number;
  titulo: string;
  descricao?: string;
  imagem?: string;
  imagens?: string[];
  tags?: string[];
  visualizacoes?: number;
  curtidas: { id: number; usuarioId: number }[];
  autor?: { id: number; nome: string; username: string; fotoPerfil?: string };
  onCurtidaChange?: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
}

export default function PostCard({ id, titulo, descricao, imagem, imagens, tags, visualizacoes, curtidas, autor, onCurtidaChange, onDelete, onEdit }: PostCardProps) {
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const allImages = (imagens?.length ?? 0) > 0 ? imagens! : (imagem ? [imagem] : []);
  const [slideIdx, setSlideIdx] = useState(0);

  const jaCurtiu = curtidas.some((c) => c.usuarioId === usuario?.id);
  const totalCurtidas = curtidas.length;
  const ehDono = usuario?.id === autor?.id;

  const [salvo, setSalvo] = useState(false);
  const [toast, setToast] = useState("");
  const [menuAberto, setMenuAberto] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [shareAberto, setShareAberto] = useState(false);
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

  async function excluir(e: React.MouseEvent) {
    e.stopPropagation();
    setMenuAberto(false);
    if (!confirm("Excluir este post? Esta ação não pode ser desfeita.")) return;
    try {
      await api.delete(`/post/${id}`);
      onDelete?.();
    } catch { mostrarToast("Erro ao excluir post."); }
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
          {autor && <p className="post-card__subtitulo">por {autor.nome}</p>}
        </div>

        <div className="post-card__image-wrapper">
          {allImages.length === 0 ? (
            <div className="post-card__no-image"><ImageOffIcon size={36} /></div>
          ) : allImages.length === 1 ? (
            isVideo(allImages[0]) ? (
              <div className="post-card__video-thumb">
                <video src={allImages[0]} preload="metadata" muted playsInline />
                <span className="post-card__play-badge"><PlayIcon size={20} /></span>
              </div>
            ) : (
              <img src={allImages[0]} alt={titulo} loading="lazy" />
            )
          ) : (
            <div className="post-card__carousel" onClick={e => e.stopPropagation()}>
              {isVideo(allImages[slideIdx]) ? (
                <div className="post-card__video-thumb">
                  <video src={allImages[slideIdx]} preload="metadata" muted playsInline />
                  <span className="post-card__play-badge"><PlayIcon size={20} /></span>
                </div>
              ) : (
                <img src={allImages[slideIdx]} alt={titulo} loading="lazy" />
              )}
              <button
                className="post-card__arrow post-card__arrow--prev"
                onClick={e => { e.stopPropagation(); setSlideIdx(i => (i - 1 + allImages.length) % allImages.length); }}
              >‹</button>
              <button
                className="post-card__arrow post-card__arrow--next"
                onClick={e => { e.stopPropagation(); setSlideIdx(i => (i + 1) % allImages.length); }}
              >›</button>
              <div className="post-card__dots" onClick={e => e.stopPropagation()}>
                {allImages.map((_, i) => (
                  <button
                    key={i}
                    className={`post-card__dot ${i === slideIdx ? "post-card__dot--ativo" : ""}`}
                    onClick={e => { e.stopPropagation(); setSlideIdx(i); }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {tags && tags.length > 0 && (
          <div className="post-card__tags">
            {tags.slice(0, 3).map(tag => (
              <span
                key={tag}
                className="post-card__tag post-card__tag--link"
                onClick={e => { e.stopPropagation(); navigate(`/tag/${tag}`); }}
              >
                #{tag}
              </span>
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
              onClick={e => { e.stopPropagation(); setShareAberto(true); }}
              title="Compartilhar"
            >
              <ShareIcon size={13} />
            </button>
          </div>

          <div className="post-card__autor">
            <div
              className="post-card__autor-link"
              onClick={e => { e.stopPropagation(); if (autor) navigate(`/u/${autor.username}`); }}
            >
              <div className="post-card__avatar">
                {autor?.fotoPerfil
                  ? <img src={autor.fotoPerfil} alt={autor.nome} />
                  : <span>{inicialAutor}</span>
                }
              </div>
              <span>{autor?.username}</span>
              {isVerificado(autor?.username) && <VerificadoIcon size={13} />}
            </div>
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

      {shareAberto && (
        <ShareModal
          tipo="post"
          id={id}
          titulo={titulo}
          subtitulo={autor ? `por ${autor.nome}` : undefined}
          onClose={() => setShareAberto(false)}
        />
      )}
      {toast && <Toast mensagem={toast} visivel={!!toast} onFadeOut={() => setToast("")} />}
    </>
  );
}
