import React, { useEffect, useState } from "react";

interface Usuario {
  id: number;
  nome: string;
  username: string;
  posts: any[];
}

export default function Perfil() {
  const [user, setUser] = useState<Usuario | null>(null);

  useEffect(() => {
    fetch("http://localhost:3000/usuario/1") // substitua pelo usuário logado
      .then((res) => res.json())
      .then((data) => setUser(data.data))
      .catch((err) => console.error(err));
  }, []);

  if (!user) return <p>Carregando...</p>;

  return (
    <div className="bg-white p-4 rounded shadow space-y-4">
      <h1 className="text-2xl font-bold">
        {user.nome} (@{user.username})
      </h1>
      <div className="flex gap-6">
        <div>
          <span className="font-bold">{user.posts.length}</span> Posts
        </div>
        <div>
          <span className="font-bold">0</span> Seguidores
        </div>
        <div>
          <span className="font-bold">0</span> Seguindo
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {user.posts.map((post) => (
          <div
            key={post.id}
            className="bg-gray-200 h-24 flex items-center justify-center"
          >
            {post.titulo}
          </div>
        ))}
      </div>
    </div>
  );
}
