import React from "react";
import "../styles/components/ProfileCard.scss";

interface PostProps {
  imagem: string;
  titulo: string;
  curtidas: number;
  comentarios: number;
}

export default function PostCard({
  imagem,
  titulo,
  curtidas,
  comentarios,
}: PostProps) {
  return (
    <div className="post-card">
      <img src={imagem} alt={titulo} />
      <div className="post-info">
        <span>❤️ {curtidas}</span>
        <span>💬 {comentarios}</span>
      </div>
    </div>
  );
}
