// src/pages/Busca.tsx
import React, { useEffect, useState } from "react";

interface Usuario {
  id: number;
  nome: string;
  username: string;
  fotoPerfil?: string | null;
}

interface Post {
  id: number;
  usuarioId: number;
  titulo: string;
  imagem?: string | null;
  curtidas: number;
  comentarios: number;
}

export default function Busca() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const usuariosRes = await fetch("http://localhost:3000/usuario");
        const usuariosData = await usuariosRes.json();
        setUsuarios(usuariosData.data || []);

        const postsRes = await fetch("http://localhost:3000/post");
        const postsData = await postsRes.json();
        setPosts(postsData.data || []);
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const usuariosFiltrados = usuarios.filter(
    (u) =>
      u.nome.toLowerCase().includes(search.toLowerCase()) ||
      u.username.toLowerCase().includes(search.toLowerCase())
  );

  const postsFiltrados = posts.filter((p) =>
    p.titulo.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <p className="p-4">Carregando...</p>;

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <input
        type="text"
        placeholder="Pesquisar usuários ou artes"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border rounded px-4 py-2 w-full mb-6 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />

      <h2 className="text-xl font-semibold mb-4">Usuários</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-8">
        {usuariosFiltrados.length === 0 && <p>Nenhum usuário encontrado</p>}
        {usuariosFiltrados.map((usuario) => (
          <div
            key={usuario.id}
            className="flex flex-col items-center border rounded p-2 hover:shadow-lg transition-shadow cursor-pointer"
          >
            <img
              src={usuario.fotoPerfil || "/default-avatar.png"}
              alt={usuario.nome}
              className="w-16 h-16 rounded-full mb-2 object-cover"
            />
            <p className="font-semibold">{usuario.nome}</p>
            <p className="text-gray-500 text-sm">@{usuario.username}</p>
          </div>
        ))}
      </div>

      <h2 className="text-xl font-semibold mb-4">Posts</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {postsFiltrados.length === 0 && <p>Nenhum post encontrado</p>}
        {postsFiltrados.map((post) => (
          <div
            key={post.id}
            className="border rounded overflow-hidden shadow hover:shadow-lg transition-shadow cursor-pointer"
          >
            {post.imagem && (
              <img
                src={post.imagem}
                alt={post.titulo}
                className="w-full h-64 object-cover"
              />
            )}
            <div className="p-4">
              <p className="font-semibold mb-2">{post.titulo}</p>
              <div className="flex justify-between text-gray-500 text-sm">
                <span>❤️ {post.curtidas}</span>
                <span>💬 {post.comentarios}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
