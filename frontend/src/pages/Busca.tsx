import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../api/api";
import PostCard from "../components/PostCard";
import Footer from "../components/Footer";
import { SearchIcon } from "../components/Icons";
import "../styles/components/Busca.scss";

interface Post {
  id: number;
  titulo: string;
  descricao?: string;
  imagem?: string;
  curtidas: { id: number; usuarioId: number }[];
  comentarios: { id: number }[];
  autor: { id: number; nome: string; username: string; fotoPerfil?: string };
}

export default function Busca() {
  const [searchParams] = useSearchParams();
  const [todos, setTodos] = useState<Post[]>([]);
  const [busca, setBusca] = useState(searchParams.get("q") ?? "");
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    api.get("/post")
      .then((res) => setTodos(Array.isArray(res.data) ? res.data : []))
      .catch(() => setTodos([]))
      .finally(() => setCarregando(false));
  }, []);

  useEffect(() => {
    setBusca(searchParams.get("q") ?? "");
  }, [searchParams]);

  const termo = busca.trim().toLowerCase();
  const filtrados = termo
    ? todos.filter((p) =>
        p.titulo.toLowerCase().includes(termo) ||
        (p.descricao ?? "").toLowerCase().includes(termo) ||
        p.autor.nome.toLowerCase().includes(termo) ||
        p.autor.username.toLowerCase().includes(termo)
      )
    : todos;

  function recarregar() {
    api.get("/post").then((res) => setTodos(Array.isArray(res.data) ? res.data : []));
  }

  return (
    <div className="busca">
      <div className="busca__header">
        <span className="busca__label">Pesquisar</span>
        <div className="busca__input-wrapper">
          <SearchIcon size={16} className="busca__icon" />
          <input
            className="busca__input"
            type="text"
            placeholder="Título, artista, técnica..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            autoFocus
          />
          {busca && (
            <button className="busca__clear" onClick={() => setBusca("")}>&times;</button>
          )}
        </div>
        {!carregando && (
          <p className="busca__count">
            {filtrados.length} resultado{filtrados.length !== 1 ? "s" : ""}
            {termo ? ` para "${busca}"` : ""}
          </p>
        )}
      </div>

      <div className="busca__body">
        {carregando ? (
          <div className="busca__empty"><p>Carregando...</p></div>
        ) : filtrados.length === 0 ? (
          <div className="busca__empty">
            <SearchIcon size={40} className="busca__empty-icon" />
            <p>Nenhum resultado encontrado</p>
            <small>Tente buscar por outro título ou artista</small>
          </div>
        ) : (
          <div className="busca__grid">
            {filtrados.map((post) => (
              <PostCard
                key={post.id}
                id={post.id}
                titulo={post.titulo}
                imagem={post.imagem}
                curtidas={post.curtidas}
                autor={post.autor}
                onCurtidaChange={recarregar}
              />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
