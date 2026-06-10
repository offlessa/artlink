import { useEffect, useState, useMemo } from "react";
import { api } from "../api/api";
import { useAuth } from "../context/AuthContext";
import { useI18n } from "../hooks/useI18n";
import PostCard from "../components/PostCard";
import Footer from "../components/Footer";
import "../styles/components/Arte.scss";

interface Post {
  id: number;
  titulo: string;
  descricao?: string;
  imagem?: string;
  imagens?: string[];
  curtidas: { id: number; usuarioId: number }[];
  comentarios: { id: number }[];
  autor: { id: number; nome: string; username: string; fotoPerfil?: string };
}

const CATEGORIAS = ["Metal", "Crochê", "Plumária", "Cerâmica", "Madeira", "Bordado", "Macramê"];

export default function Arte() {
  const { usuario } = useAuth();
  const t = useI18n();
  const [posts, setPosts] = useState<Post[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [categoria, setCategoria] = useState<string | null>(null);

  async function carregarPosts() {
    setCarregando(true);
    try {
      const res = await api.get("/post");
      const dados: Post[] = Array.isArray(res.data) ? res.data : [];
      setPosts(dados);
    } catch {
      setPosts([]);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarPosts();
  }, []);

  const filtrados = useMemo(() => {
    const lista = categoria
      ? posts.filter(p =>
          p.titulo.toLowerCase().includes(categoria.toLowerCase()) ||
          (p.descricao ?? "").toLowerCase().includes(categoria.toLowerCase())
        )
      : posts;
    return [...lista].sort((a, b) => b.curtidas.length - a.curtidas.length);
  }, [posts, categoria]);

  return (
    <div className="arte">
      <div className="arte__header">
        <h1 className="arte__titulo">{t.art.title}</h1>
        <p className="arte__sub">{t.art.subtitle}</p>
      </div>

      <div className="arte__body">
        {/* Filtros */}
        <div className="arte__filters">
          <button
            className={`arte__pill ${!categoria ? "arte__pill--ativo" : ""}`}
            onClick={() => setCategoria(null)}
          >
            {t.art.all}
          </button>
          {CATEGORIAS.map(cat => (
            <button
              key={cat}
              className={`arte__pill ${categoria === cat ? "arte__pill--ativo" : ""}`}
              onClick={() => setCategoria(categoria === cat ? null : cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {carregando ? (
          <div className="arte__grid">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="arte__skeleton" />
            ))}
          </div>
        ) : filtrados.length === 0 ? (
          <div className="arte__vazio">
            <p>{t.art.empty}</p>
          </div>
        ) : (
          <div className="arte__grid">
            {filtrados.map(post => (
              <PostCard
                key={post.id}
                id={post.id}
                titulo={post.titulo}
                descricao={post.descricao}
                imagem={post.imagem}
                imagens={post.imagens}
                curtidas={post.curtidas}
                autor={post.autor}
                onCurtidaChange={carregarPosts}
              />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
