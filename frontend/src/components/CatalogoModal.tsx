import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/api";
import { uploadImagem } from "../api/upload";
import { XIcon, CameraIcon } from "./Icons";
import "../styles/components/CatalogoModal.scss";

interface Props { onClose: () => void }

export default function CatalogoModal({ onClose }: Props) {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [capaUrl, setCapaUrl] = useState<string | null>(null);
  const [capaPreview, setCapaPreview] = useState<string | null>(null);
  const [uploadandoCapa, setUploadandoCapa] = useState(false);
  const [criando, setCriando] = useState(false);

  async function handleCapa(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setCapaPreview(URL.createObjectURL(file));
    setUploadandoCapa(true);
    try {
      const url = await uploadImagem(file);
      setCapaUrl(url);
    } catch {
      setCapaPreview(null);
    } finally {
      setUploadandoCapa(false);
    }
  }

  async function criar() {
    if (!nome.trim() || !usuario || uploadandoCapa) return;
    setCriando(true);
    try {
      const res = await api.post("/catalogo", {
        usuarioId: usuario.id,
        nome: nome.trim(),
        descricao: descricao.trim() || null,
        capa: capaUrl || null,
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
          {/* Capa */}
          <div className="catm__capa" onClick={() => fileRef.current?.click()}>
            {capaPreview
              ? <img src={capaPreview} alt="capa" />
              : (
                <div className="catm__capa-placeholder">
                  <CameraIcon size={22} />
                  <span>Adicionar capa</span>
                </div>
              )
            }
            {uploadandoCapa && <div className="catm__capa-loading">Enviando...</div>}
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleCapa} />
          </div>
          {capaPreview && (
            <button
              className="catm__capa-remover"
              type="button"
              onClick={() => { setCapaPreview(null); setCapaUrl(null); }}
            >
              Remover capa
            </button>
          )}

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
            disabled={!nome.trim() || criando || uploadandoCapa}
          >
            {criando ? "Criando..." : "Criar catálogo"}
          </button>
        </div>
      </div>
    </div>
  );
}
