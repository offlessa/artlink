import { useEffect, useState } from "react";
import { api } from "../api/api";
import PostCard from "../components/PostCard";
import Footer from "../components/Footer";
import "../styles/components/Home.scss";

interface Post {
  id: number;
  titulo: string;
  descricao?: string;
  imagem?: string;
  curtidas: { id: number; usuarioId: number }[];
  comentarios: { id: number }[];
  autor: { id: number; nome: string; username: string; fotoPerfil?: string };
}

const CATEGORIAS = ["Metal", "Crochê", "Plumária", "Cerâmica", "Madeira", "Bordado", "Macramê"];

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [categoria, setCategoria] = useState<string | null>(null);

  async function carregarPosts() {
    try {
      const res = await api.get("/post");
      setPosts(Array.isArray(res.data) ? res.data : []);
    } catch {
      setPosts([]);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => { carregarPosts(); }, []);

  const filtrados = categoria
    ? posts.filter((p) =>
        p.titulo.toLowerCase().includes(categoria.toLowerCase()) ||
        (p.descricao ?? "").toLowerCase().includes(categoria.toLowerCase())
      )
    : posts;

  return (
    <div className="home">
      <div className="home__filters">
        <button
          className={`home__pill ${!categoria ? "home__pill--ativo" : ""}`}
          onClick={() => setCategoria(null)}
        >
          Tudo
        </button>
        {CATEGORIAS.map((cat) => (
          <button
            key={cat}
            className={`home__pill ${categoria === cat ? "home__pill--ativo" : ""}`}
            onClick={() => setCategoria(categoria === cat ? null : cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="home__body">
        {carregando ? (
          <div className="home__skeleton-grid">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="home__skeleton" />
            ))}
          </div>
        ) : filtrados.length === 0 ? (
          <div className="home__empty">
            <p>Nenhuma publicação encontrada.</p>
          </div>
        ) : (
          <div className="home__grid">
            {filtrados.map((post) => (
              <PostCard
                key={post.id}
                id={post.id}
                titulo={post.titulo}
                imagem={post.imagem}
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
