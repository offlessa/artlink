import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/api";
import { XIcon } from "./Icons";
import "../styles/components/CatalogoModal.scss";

interface Props { onClose: () => void }

export default function CatalogoModal({ onClose }: Props) {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [criando, setCriando] = useState(false);

  async function criar() {
    if (!nome.trim() || !usuario) return;
    setCriando(true);
    try {
      const res = await api.post("/catalogo", {
        usuarioId: usuario.id,
        nome: nome.trim(),
        descricao: descricao.trim() || null,
      });
      const id = res.data?.data?.id ?? res.data?.id;
      onClose();
      navigate(`/catalogo/${id}`);
    } catch { setCriando(false); }
  }

  return (
    <div className="catm-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="catm">
        <div className="catm__header">
          <span>Novo catálogo</span>
          <button onClick={onClose}><XIcon size={18} /></button>
        </div>
        <div className="catm__body">
          <input
            className="catm__input"
            placeholder="Nome do catálogo *"
            value={nome}
            onChange={e => setNome(e.target.value)}
            maxLength={100}
            autoFocus
            onKeyDown={e => { if (e.key === "Enter") criar(); }}
          />
          <textarea
            className="catm__textarea"
            placeholder="Descrição (opcional)"
            value={descricao}
            onChange={e => setDescricao(e.target.value)}
            maxLength={500}
          />
          <button
            className="catm__btn"
            onClick={criar}
            disabled={!nome.trim() || criando}
          >
            {criando ? "Criando..." : "Criar catálogo"}
          </button>
        </div>
      </div>
    </div>
  );
}
