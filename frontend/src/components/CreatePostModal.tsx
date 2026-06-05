import { useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/api";
import { uploadImagem } from "../api/upload";
import { XIcon, ImageIcon, ChevronRightIcon, PlusIcon } from "./Icons";
import "../styles/components/CreatePostModal.scss";

interface Colaborador { id: number; nome: string; username: string; fotoPerfil?: string }

interface Props { onClose: () => void; onSuccess: () => void; catalogoId?: number }

export default function CreatePostModal({ onClose, onSuccess, catalogoId }: Props) {
  const { usuario } = useAuth();
  const [step, setStep] = useState<"upload" | "form">("upload");
  const [preview, setPreview] = useState<string | null>(null);
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [buscaColab, setBuscaColab] = useState("");
  const [resultadosColab, setResultadosColab] = useState<Colaborador[]>([]);
  const [mostrarColab, setMostrarColab] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [criando, setCriando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function lerArquivo(file: File) {
    if (!file.type.startsWith("image/")) return;
    setArquivo(file);
    setPreview(URL.createObjectURL(file));
    setStep("form");
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) lerArquivo(file);
  }

  async function buscarColab(query: string) {
    setBuscaColab(query);
    if (!query.trim()) { setResultadosColab([]); return; }
    try {
      const res = await api.get("/usuario");
      const todos: Colaborador[] = Array.isArray(res.data) ? res.data : [];
      const q = query.toLowerCase();
      setResultadosColab(
        todos.filter(u => u.id !== usuario?.id && (
          u.username.toLowerCase().includes(q) || u.nome.toLowerCase().includes(q)
        )).slice(0, 5)
      );
    } catch { setResultadosColab([]); }
  }

  function adicionarColab(c: Colaborador) {
    if (!colaboradores.find(x => x.id === c.id)) setColaboradores(p => [...p, c]);
    setBuscaColab(""); setResultadosColab([]);
  }

  async function publicar() {
    if (!titulo.trim() || !usuario) return;
    setCriando(true);
    setErro(null);
    try {
      let imagemUrl: string | null = null;
      if (arquivo) {
        try {
          imagemUrl = await uploadImagem(arquivo);
        } catch (uploadErr: any) {
          const status = uploadErr?.response?.status;
          const msg = uploadErr?.response?.data?.message ?? uploadErr?.response?.data?.error ?? uploadErr?.message;
          setErro(`Erro no upload (${status ?? "sem conexão"}): ${msg ?? "verifique se o servidor está rodando."}`);
          setCriando(false);
          return;
        }
      }

      const res = await api.post("/post", {
        usuarioId: usuario.id,
        titulo: titulo.trim(),
        descricao: descricao.trim() || null,
        imagem: imagemUrl,
        tags,
      });
      const postId = res.data?.data?.id ?? res.data?.id;
      for (const c of colaboradores) {
        try { await api.post("/post/colaboracao", { postId, usuarioId: c.id }); } catch {}
      }
      if (catalogoId && postId) {
        try { await api.post("/catalogo/post", { catalogoId, postId }); } catch {}
      }
      onSuccess();
      onClose();
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? e?.message ?? "Erro ao publicar. Tente novamente.";
      setErro(msg);
      setCriando(false);
    }
  }

  const inicial = usuario?.nome?.charAt(0).toUpperCase() ?? "?";

  return (
    <div className="cpm-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="cpm">
        <div className="cpm__header">
          <button className="cpm__back" onClick={step === "form" ? () => setStep("upload") : onClose}>
            {step === "form" ? <ChevronRightIcon size={16} className="cpm__back-icon" /> : <XIcon size={18} />}
          </button>
          <span>{step === "upload" ? "Nova publicação" : "Detalhes"}</span>
          <button className="cpm__close" onClick={onClose}><XIcon size={18} /></button>
        </div>

        {step === "upload" ? (
          <div
            className={`cpm__drop ${dragging ? "cpm__drop--over" : ""}`}
            onClick={() => fileRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
          >
            <div className="cpm__drop-icon"><ImageIcon size={52} /></div>
            <p className="cpm__drop-title">Arraste sua foto aqui</p>
            <p className="cpm__drop-sub">PNG, JPG, WEBP</p>
            <button className="cpm__drop-btn" type="button">Selecionar do computador</button>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={e => { const f = e.target.files?.[0]; if (f) lerArquivo(f); }} />
          </div>
        ) : (
          <div className="cpm__form">
            <div className="cpm__preview">
              <img src={preview!} alt="preview" />
            </div>
            <div className="cpm__fields">
              <div className="cpm__user-row">
                <div className="cpm__avatar">
                  {usuario?.fotoPerfil ? <img src={usuario.fotoPerfil} alt="" /> : <span>{inicial}</span>}
                </div>
                <span>{usuario?.username}</span>
              </div>

              <textarea
                className="cpm__area"
                placeholder="Título da obra *"
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

              {/* Tags */}
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
                  placeholder="Digite uma tag e pressione Enter"
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

              <div className="cpm__collab">
                <button className="cpm__collab-toggle" type="button" onClick={() => setMostrarColab(p => !p)}>
                  <PlusIcon size={13} />
                  <span>Colaboração</span>
                  <ChevronRightIcon size={13} className={`cpm__chevron ${mostrarColab ? "cpm__chevron--open" : ""}`} />
                </button>
                {mostrarColab && (
                  <div className="cpm__collab-body">
                    <input
                      className="cpm__collab-input"
                      type="text"
                      placeholder="Buscar @username ou nome..."
                      value={buscaColab}
                      onChange={e => buscarColab(e.target.value)}
                    />
                    {resultadosColab.map(u => (
                      <div key={u.id} className="cpm__collab-result" onClick={() => adicionarColab(u)}>
                        <div className="cpm__collab-av">
                          {u.fotoPerfil ? <img src={u.fotoPerfil} alt="" /> : <span>{u.nome.charAt(0)}</span>}
                        </div>
                        <div><p>{u.nome}</p><small>@{u.username}</small></div>
                      </div>
                    ))}
                    {colaboradores.length > 0 && (
                      <div className="cpm__collab-tags">
                        {colaboradores.map(c => (
                          <span key={c.id} className="cpm__collab-tag">
                            @{c.username}
                            <button type="button" onClick={() => setColaboradores(p => p.filter(x => x.id !== c.id))}>&times;</button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {erro && <p className="cpm__erro">{erro}</p>}

              <button className="cpm__publicar" onClick={publicar} disabled={!titulo.trim() || criando}>
                {criando ? "Publicando..." : "Publicar"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
