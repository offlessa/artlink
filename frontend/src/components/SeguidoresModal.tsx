import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/api";
import { XIcon } from "./Icons";
import "../styles/components/SeguidoresModal.scss";

interface User {
  id: number;
  nome: string;
  username: string;
  fotoPerfil?: string;
}

interface Props {
  usuarioId: number;
  tipo: "seguidores" | "seguindo";
  onClose: () => void;
}

export default function SeguidoresModal({ usuarioId, tipo, onClose }: Props) {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const endpoint = tipo === "seguidores"
      ? `/seguidor/seguidores/${usuarioId}`
      : `/seguidor/seguindo/${usuarioId}`;
    api.get(endpoint)
      .then(r => setUsers(Array.isArray(r.data) ? r.data : (r.data?.data ?? [])))
      .catch(() => setUsers([]))
      .finally(() => setCarregando(false));
  }, [usuarioId, tipo]);

  function irParaPerfil(username: string) {
    navigate(`/u/${username}`);
    onClose();
  }

  return (
    <div className="seg-modal-overlay" onClick={onClose}>
      <div className="seg-modal" onClick={e => e.stopPropagation()}>
        <div className="seg-modal__header">
          <h3>{tipo === "seguidores" ? "Seguidores" : "Seguindo"}</h3>
          <button className="seg-modal__close" onClick={onClose}><XIcon size={18} /></button>
        </div>
        <div className="seg-modal__lista">
          {carregando ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="seg-modal__skeleton" />
            ))
          ) : users.length === 0 ? (
            <p className="seg-modal__vazio">
              {tipo === "seguidores" ? "Nenhum seguidor ainda." : "Não segue ninguém ainda."}
            </p>
          ) : (
            users.map(u => (
              <button key={u.id} className="seg-modal__user" onClick={() => irParaPerfil(u.username)}>
                <div className="seg-modal__avatar">
                  {u.fotoPerfil
                    ? <img src={u.fotoPerfil} alt={u.nome} />
                    : <span>{u.nome.charAt(0).toUpperCase()}</span>}
                </div>
                <div className="seg-modal__info">
                  <span className="seg-modal__nome">{u.nome}</span>
                  <span className="seg-modal__username">@{u.username}</span>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
