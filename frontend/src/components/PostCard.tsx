import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/api";
import { HeartIcon, ImageOffIcon, BookmarkIcon, ShareIcon } from "./Icons";
import Toast from "./Toast";
import { copiarLink } from "../utils/compartilhar";
import "../styles/components/PostCard.scss";

interface PostCardProps {
  id: number;
  titulo: string;
  descricao?: string;
  imagem?: string;
  curtidas: { id: number; usuarioId: number }[];
  autor?: { id: number; nome: string; username: string; fotoPerfil?: string };
  onCurtidaChange?: () => void;
}

export default function PostCard({ id, titulo, descricao, imagem, curtidas, autor, onCurtidaChange }: PostCardProps) {
  const navigate = useNavigate();
  const { usuario } = useAuth();

  const jaCurtiu = curtidas.some((c) => c.usuarioId === usuario?.id);
  const totalCurtidas = curtidas.length;

  const [salvo, setSalvo] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (!usuario) return;
    api.get(`/post-salvo/checar/${usuario.id}/${id}`)
      .then(r => setSalvo(r.data?.salvo ?? false))
      .catch(() => {});
  }, [usuario?.id, id]);

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

  function mostrarToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  }

  const inicialAutor = autor?.nome?.charAt(0).toUpperCase() ?? "?";

  return (
    <>
      <article className="post-card" onClick={() => navigate(`/post/${id}`)}>
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
              onClick={compartilhar}
              title="Compartilhar"
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
          </div>
        </div>
      </article>

      {toast && <Toast mensagem={toast} visivel={!!toast} onFadeOut={() => setToast("")} />}
    </>
  );
}
