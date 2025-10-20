import React, { useEffect, useState } from "react";
import PostCard from "../components/PostCard";
import "../styles/components/Busca.scss";

interface User {
  id: number;
  nome: string;
  username: string;
  posts: any[];
  seguidores: number;
  seguindo: number;
}

export default function Perfil() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    fetch("http://localhost:3000/usuario/1") // exemplo
      .then((res) => res.json())
      .then((data) => setUser(data))
      .catch((err) => console.error(err));
  }, []);

  if (!user) return <div>Carregando...</div>;

  return (
    <div className="perfil-container">
      <div className="perfil-header">
        <h2>
          {user.nome} (@{user.username})
        </h2>
        <div className="perfil-stats">
          <span>Posts: {user.posts.length}</span>
          <span>Seguindo: {user.seguindo}</span>
          <span>Seguidores: {user.seguidores}</span>
        </div>
      </div>

      <div className="perfil-posts">
        {user.posts.map((post) => (
          <PostCard key={post.id} {...post} />
        ))}
      </div>
    </div>
  );
}
