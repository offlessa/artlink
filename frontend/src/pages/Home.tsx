// src/pages/Home.tsx
import React, { useEffect, useState } from "react";

export default function Home() {
  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    fetch("http://localhost:3000/post")
      .then((res) => res.json())
      .then((data) => setPosts(data.data || []))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="p-4">
      {posts.map((post) => (
        <div key={post.id} className="border p-4 mb-4 rounded shadow">
          <h2 className="font-bold">{post.titulo}</h2>
          <p>{post.descricao}</p>
        </div>
      ))}
    </div>
  );
}
