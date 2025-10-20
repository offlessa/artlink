import React, { useState, useEffect } from "react";
import "../styles/components/Perfil.scss";

interface Usuario {
  id: number;
  nome: string;
  username: string;
  fotoPerfil: string | null;
  posts: Post[];
  seguidores: number;
  seguindo: number;
  catalogos?: Catalogo[];
}

interface Post {
  id: number;
  imagem: string;
  titulo: string;
  curtidas: number;
  comentarios: number;
}

interface Catalogo {
  id: number;
  titulo: string;
  capa: string;
}

export default function Perfil() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  useEffect(() => {
    fetch("http://localhost:3000/usuario/1") // Substituir pelo id do usuário logado
      .then((res) => res.json())
      .then((data) => setUsuario(data))
      .catch((err) => console.error("Erro ao buscar usuário:", err));
  }, []);

  if (!usuario) return <p>Carregando...</p>;

  return (
    <div className="perfil-container">
      <div className="perfil-header">
        <img
          src={usuario.fotoPerfil || "/default-avatar.png"}
          alt={usuario.username}
          className="perfil-avatar"
        />
        <div className="perfil-info">
          <h2>{usuario.username}</h2>
          <div className="perfil-stats">
            <span>
              <strong>{usuario.posts.length}</strong> posts
            </span>
            <span>
              <strong>{usuario.seguidores}</strong> seguidores
            </span>
            <span>
              <strong>{usuario.seguindo}</strong> seguindo
            </span>
          </div>
        </div>
      </div>

      <div className="perfil-posts">
        <h3>Posts</h3>
        <div className="posts-grid">
          {usuario.posts.map((post) => (
            <div key={post.id} className="post-card">
              <img src={post.imagem} alt={post.titulo} />
              <div className="post-overlay">
                <span>❤ {post.curtidas}</span>
                <span>💬 {post.comentarios}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {usuario.catalogos && usuario.catalogos.length > 0 && (
        <div className="perfil-catalogos">
          <h3>Catálogos</h3>
          <div className="catalogos-grid">
            {usuario.catalogos.map((cat) => (
              <div key={cat.id} className="catalogo-card">
                <img src={cat.capa} alt={cat.titulo} />
                <span>{cat.titulo}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
