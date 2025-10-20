import React, { useEffect, useState } from "react";
import PostCard from "../components/PostCard";
import "../styles/components/Home.scss";

interface Post {
  id: number;
  titulo: string;
  imagem: string;
  curtidas: number;
  comentarios: number;
}

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    fetch("http://localhost:3000/post")
      .then((res) => res.json())
      .then((data) => setPosts(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="home-container">
      {posts.map((post) => (
        <PostCard key={post.id} {...post} />
      ))}
    </div>
  );
}
