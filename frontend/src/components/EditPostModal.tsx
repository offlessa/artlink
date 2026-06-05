import { useState } from "react";
import { api } from "../api/api";
import { XIcon } from "./Icons";
import "../styles/components/CreatePostModal.scss";

interface Props {
  id: number;
  tituloInicial: string;
  descricaoInicial?: string;
  tagsIniciais?: string[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditPostModal({ id, tituloInicial, descricaoInicial, tagsIniciais, onClose, onSuccess }: Props) {
  const [titulo, setTitulo] = useState(tituloInicial);
  const [descricao, setDescricao] = useState(descricaoInicial ?? "");
  const [tags, setTags] = useState<string[]>(tagsIniciais ?? []);
  const [tagInput, setTagInput] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    if (!titulo.trim()) { setErro("Título é obrigatório."); return; }
    setSalvando(true);
    try {
      await api.put(`/post/${id}`, { titulo: titulo.trim(), descricao: descricao.trim() || null, tags });
      onSuccess();
      onClose();
    } catch { setErro("Erro ao salvar. Tente novamente."); }
    finally { setSalvando(false); }
  }

  return (
    <div className="cpm-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="cpm" style={{ maxWidth: 480 }}>
        <div className="cpm__header">
          <span>Editar publicação</span>
          <button className="cpm__close" onClick={onClose}><XIcon size={18} /></button>
        </div>
        <form className="cpm__fields" onSubmit={salvar} style={{ padding: "20px 24px" }}>
          <textarea
            className="cpm__area"
            placeholder="Título *"
            value={titulo}
            onChange={e => setTitulo(e.target.value)}
            maxLength={150}
            autoFocus
          />
          <textarea
            className="cpm__area cpm__area--sm"
            placeholder="Descrição (opcional)"
            value={descricao}
            onChange={e => setDescricao(e.target.value)}
            maxLength={1000}
          />
          <div className="cpm__tags-wrap">
            <div className="cpm__tags-list">
              {tags.map(t => (
                <span key={t} className="cpm__tag">
                  #{t}
                  <button type="button" onClick={() => setTags(p => p.filter(x => x !== t))}>&times;</button>
                </span>
              ))}
            </div>
            <input
              className="cpm__tag-input"
              type="text"
              placeholder="Adicionar tag e pressionar Enter"
              value={tagInput}
              onChange={e => setTagInput(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
              onKeyDown={e => {
                if (e.key === "Enter" || e.key === ",") {
                  e.preventDefault();
                  e.stopPropagation();
                  const nova = tagInput.trim();
                  if (nova && !tags.includes(nova) && tags.length < 10) {
                    setTags(p => [...p, nova]);
                    setTagInput("");
                  }
                }
              }}
            />
          </div>
          {erro && <p style={{ color: "#C0392B", fontSize: "0.82rem", margin: "4px 0" }}>{erro}</p>}
          <button className="cpm__publicar" type="submit" disabled={salvando || !titulo.trim()} style={{ marginTop: 12 }}>
            {salvando ? "Salvando..." : "Salvar alterações"}
          </button>
        </form>
      </div>
    </div>
  );
}
