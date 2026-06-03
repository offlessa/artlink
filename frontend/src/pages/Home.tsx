import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/api";
import { useAuth } from "../context/AuthContext";
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
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [feedPosts, setFeedPosts] = useState<Post[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [categoria, setCategoria] = useState<string | null>(null);
  const [feedTab, setFeedTab] = useState<"explorar" | "feed">("explorar");

  async function carregarPosts() {
    setCarregando(true);
    try {
      const res = await api.get("/post");
      setPosts(Array.isArray(res.data) ? res.data : []);
    } catch {
      setPosts([]);
    } finally {
      setCarregando(false);
    }
  }

  async function carregarFeed() {
    if (!usuario) return;
    try {
      const res = await api.get(`/post/feed/${usuario.id}`);
      setFeedPosts(Array.isArray(res.data) ? res.data : []);
    } catch {
      setFeedPosts([]);
    }
  }

  useEffect(() => {
    carregarPosts();
    if (usuario) carregarFeed();
  }, [usuario?.id]);

  const listaAtiva = feedTab === "feed" ? feedPosts : posts;

  const filtrados = categoria
    ? listaAtiva.filter(p =>
        p.titulo.toLowerCase().includes(categoria.toLowerCase()) ||
        (p.descricao ?? "").toLowerCase().includes(categoria.toLowerCase())
      )
    : listaAtiva;

  return (
    <div className="home">
      {/* TABS feed / explorar */}
      {usuario && (
        <div className="home__feed-tabs">
          <button
            className={feedTab === "explorar" ? "active" : ""}
            onClick={() => setFeedTab("explorar")}
          >
            Explorar
          </button>
          <button
            className={feedTab === "feed" ? "active" : ""}
            onClick={() => setFeedTab("feed")}
          >
            Para você
          </button>
        </div>
      )}

      {/* FILTROS por categoria */}
      <div className="home__filters">
        <button
          className={`home__pill ${!categoria ? "home__pill--ativo" : ""}`}
          onClick={() => setCategoria(null)}
        >
          Tudo
        </button>
        {CATEGORIAS.map(cat => (
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
        ) : feedTab === "feed" && feedPosts.length === 0 ? (
          <div className="home__empty">
            <p>Nenhuma publicação dos seus seguidos ainda.</p>
            <button className="home__explorar-btn" onClick={() => setFeedTab("explorar")}>
              Explorar tudo
            </button>
          </div>
        ) : filtrados.length === 0 ? (
          <div className="home__empty">
            <p>Nenhuma publicação encontrada.</p>
          </div>
        ) : (
          <div className="home__grid">
            {filtrados.map(post => (
              <PostCard
                key={post.id}
                id={post.id}
                titulo={post.titulo}
                descricao={post.descricao}
                imagem={post.imagem}
                curtidas={post.curtidas}
                autor={post.autor}
                onCurtidaChange={() => { carregarPosts(); if (usuario) carregarFeed(); }}
              />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
