import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/api";
import { HeartIcon, ImageOffIcon } from "./Icons";
import "../styles/components/PostCard.scss";

interface PostCardProps {
  id: number;
  titulo: string;
  imagem?: string;
  curtidas: { id: number; usuarioId: number }[];
  autor?: { id: number; nome: string; username: string; fotoPerfil?: string };
  onCurtidaChange?: () => void;
}

export default function PostCard({ id, titulo, imagem, curtidas, autor, onCurtidaChange }: PostCardProps) {
  const navigate = useNavigate();
  const { usuario } = useAuth();

  const jaCurtiu = curtidas.some((c) => c.usuarioId === usuario?.id);
  const totalCurtidas = curtidas.length;

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
    } catch (err) {
      console.error("Erro ao curtir:", err);
    }
  }

  const inicialAutor = autor?.nome?.charAt(0).toUpperCase() ?? "?";

  return (
    <article className="post-card" onClick={() => navigate(`/post/${id}`)}>
      <div className="post-card__image-wrapper">
        {imagem
          ? <img src={imagem} alt={titulo} loading="lazy" />
          : <div className="post-card__no-image"><ImageOffIcon size={32} /></div>
        }
        <button
          className={`post-card__like ${jaCurtiu ? "post-card__like--ativo" : ""}`}
          onClick={toggleCurtida}
          title={jaCurtiu ? "Descurtir" : "Curtir"}
        >
          <HeartIcon size={14} filled={jaCurtiu} />
        </button>
      </div>

      <div className="post-card__info">
        <p className="post-card__titulo">{titulo}</p>
        {autor && (
          <div className="post-card__autor">
            <div className="post-card__avatar">
              {autor.fotoPerfil
                ? <img src={autor.fotoPerfil} alt={autor.nome} />
                : <span>{inicialAutor}</span>
              }
            </div>
            <span className="post-card__autor-nome">{autor.nome}</span>
          </div>
        )}
        <div className="post-card__curtidas">
          <HeartIcon size={12} filled={jaCurtiu} />
          <span>{totalCurtidas}</span>
        </div>
      </div>
    </article>
  );
}
