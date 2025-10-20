import React, { useState, useEffect } from "react";
import PostCard from "../components/PostCard";
import "../styles/components/Busca.scss";

interface Post {
  id: number;
  titulo: string;
  imagem: string;
  curtidas: number;
  comentarios: number;
  autor: string;
}

export default function Busca() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [search, setSearch] = useState("");
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);

  useEffect(() => {
    fetch("http://localhost:3000/post") // substitua pelo endpoint real
      .then((res) => res.json())
      .then((data) => setPosts(data))
      .catch((err) => console.error("Erro ao buscar posts:", err));
  }, []);

  useEffect(() => {
    setFilteredPosts(
      posts.filter((post) =>
        post.autor.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search, posts]);

  return (
    <div className="busca-container">
      <div className="search-bar">
        <input
          type="text"
          placeholder="Pesquisar por usuário ou artista..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="posts-grid">
        {filteredPosts.map((post) => (
          <PostCard
            key={post.id}
            imagem={post.imagem}
            titulo={post.titulo}
            curtidas={post.curtidas}
            comentarios={post.comentarios}
          />
        ))}
        {filteredPosts.length === 0 && (
          <p className="no-results">Nenhum resultado encontrado.</p>
        )}
      </div>
    </div>
  );
}
