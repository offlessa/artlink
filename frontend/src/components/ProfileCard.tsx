import React from "react";
import "../styles/components/ProfileCard.scss";

interface ProfileCardProps {
  nome: string;
  username: string;
  fotoPerfil?: string;
  posts?: number;
  seguidores?: number;
  seguindo?: number;
  onFollow?: () => void;
}

export default function ProfileCard({
  nome,
  username,
  fotoPerfil,
  posts = 0,
  seguidores = 0,
  seguindo = 0,
  onFollow,
}: ProfileCardProps) {
  return (
    <div className="profile-card">
      <img
        src={fotoPerfil || "/default-avatar.png"}
        alt={username}
        className="profile-avatar"
      />
      <div className="profile-info">
        <h3>{nome}</h3>
        <p>@{username}</p>
        <div className="profile-stats">
          <span>
            <strong>{posts}</strong> posts
          </span>
          <span>
            <strong>{seguidores}</strong> seguidores
          </span>
          <span>
            <strong>{seguindo}</strong> seguindo
          </span>
        </div>
        {onFollow && (
          <button className="follow-btn" onClick={onFollow}>
            Seguir
          </button>
        )}
      </div>
    </div>
  );
}
