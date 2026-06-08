import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api/api";
import { useI18n } from "../hooks/useI18n";
import { useAuth } from "../context/AuthContext";
import PostCard from "../components/PostCard";
import "../styles/components/HashtagPage.scss";

interface Post {
  id: number;
  titulo: string;
  descricao?: string;
  imagem?: string;
  tags?: string[];
  visualizacoes?: number;
  curtidas: { id: number; usuarioId: number }[];
  comentarios: { id: number }[];
  autor: { id: number; nome: string; username: string; fotoPerfil?: string };
}

export default function HashtagPage() {
  const { tag } = useParams<{ tag: string }>();
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const t = useI18n();

  const [todos, setTodos] = useState<Post[]>([]);
  const [carregando, setCarregando] = useState(true);

  async function carregar() {
    setCarregando(true);
    try {
      const res = await api.get("/post");
      setTodos(Array.isArray(res.data) ? res.data : []);
    } catch { setTodos([]); }
    finally { setCarregando(false); }
  }

  useEffect(() => { carregar(); }, [tag]);

  const filtrados = useMemo(
    () => todos.filter(p => p.tags?.includes(tag ?? "")),
    [todos, tag]
  );

  return (
    <div className="hashtag-page">
      <div className="hashtag-page__header">
        <button className="hashtag-page__back" onClick={() => navigate(-1)}>
          {t.hashtag.back}
        </button>
        <h1 className="hashtag-page__titulo">#{tag}</h1>
        {!carregando && (
          <p className="hashtag-page__count">{filtrados.length} post{filtrados.length !== 1 ? "s" : ""}</p>
        )}
      </div>

      <div className="hashtag-page__body">
        {carregando ? (
          <div className="hashtag-page__grid">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="hashtag-page__skeleton" />)}
          </div>
        ) : filtrados.length === 0 ? (
          <div className="hashtag-page__empty">
            <p>{t.hashtag.empty}</p>
          </div>
        ) : (
          <div className="hashtag-page__grid">
            {filtrados.map(post => (
              <PostCard
                key={post.id}
                id={post.id}
                titulo={post.titulo}
                descricao={post.descricao}
                imagem={post.imagem}
                tags={post.tags}
                visualizacoes={post.visualizacoes}
                curtidas={post.curtidas}
                autor={post.autor}
                onCurtidaChange={carregar}
                onDelete={carregar}
                onEdit={carregar}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
