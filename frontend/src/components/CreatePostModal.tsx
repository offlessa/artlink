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
  const [arquivos, setArquivos] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
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
  const trocarRef = useRef<HTMLInputElement>(null);
  const adicionarRef = useRef<HTMLInputElement>(null);

  function adicionarArquivos(files: File[]) {
    const validos = files.filter(f => f.type.startsWith("image/"));
    if (!validos.length) return;
    const novosPreviews = validos.map(f => URL.createObjectURL(f));
    setArquivos(prev => {
      const novo = [...prev, ...validos];
      setPreviews(p => {
        const novosP = [...p, ...novosPreviews];
        setActiveIdx(novosP.length - 1);
        return novosP;
      });
      return novo;
    });
    setStep("form");
  }

  function trocarFoto(file: File) {
    if (!file.type.startsWith("image/")) return;
    const nova = URL.createObjectURL(file);
    setArquivos(prev => { const a = [...prev]; a[activeIdx] = file; return a; });
    setPreviews(prev => { const p = [...prev]; p[activeIdx] = nova; return p; });
  }

  function removerFoto(idx: number) {
    const novosArqs = arquivos.filter((_, i) => i !== idx);
    const novosPrevs = previews.filter((_, i) => i !== idx);
    setArquivos(novosArqs);
    setPreviews(novosPrevs);
    if (novosArqs.length === 0) {
      setStep("upload");
      setActiveIdx(0);
    } else {
      setActiveIdx(Math.min(activeIdx, novosArqs.length - 1));
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const files = Array.from(e.dataTransfer.files ?? []);
    adicionarArquivos(files);
  }

  function voltarParaUpload() {
    setArquivos([]);
    setPreviews([]);
    setActiveIdx(0);
    setStep("upload");
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
      const urls: string[] = [];
      for (const arq of arquivos) {
        try {
          const url = await uploadImagem(arq);
          urls.push(url);
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
        imagem: urls[0] ?? null,
        imagens: urls,
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
          <button className="cpm__back" onClick={step === "form" ? voltarParaUpload : onClose}>
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
            <p className="cpm__drop-title">Arraste suas fotos aqui</p>
            <p className="cpm__drop-sub">PNG, JPG, WEBP · múltiplas imagens suportadas</p>
            <button className="cpm__drop-btn" type="button">Selecionar do computador</button>
            <input ref={fileRef} type="file" accept="image/*" multiple hidden
              onChange={e => adicionarArquivos(Array.from(e.target.files ?? []))} />
          </div>
        ) : (
          <div className="cpm__form">
            <div className="cpm__preview-col">
              <div className="cpm__preview">
                <img src={previews[activeIdx]} alt="preview" />
                <button
                  className="cpm__trocar-btn"
                  type="button"
                  onClick={() => trocarRef.current?.click()}
                  title="Trocar esta foto"
                >
                  Trocar foto
                </button>
                <input ref={trocarRef} type="file" accept="image/*" hidden
                  onChange={e => { const f = e.target.files?.[0]; if (f) trocarFoto(f); e.target.value = ""; }} />
              </div>

              {/* Thumbnail strip */}
              <div className="cpm__thumbs">
                {previews.map((p, i) => (
                  <div
                    key={i}
                    className={`cpm__thumb ${i === activeIdx ? "cpm__thumb--active" : ""}`}
                    onClick={() => setActiveIdx(i)}
                  >
                    <img src={p} alt={`foto ${i + 1}`} />
                    <button
                      type="button"
                      className="cpm__thumb-del"
                      onClick={e => { e.stopPropagation(); removerFoto(i); }}
                      title="Remover foto"
                    >×</button>
                  </div>
                ))}
                {previews.length < 10 && (
                  <button
                    type="button"
                    className="cpm__add-thumb"
                    onClick={() => adicionarRef.current?.click()}
                    title="Adicionar mais fotos"
                  >
                    <PlusIcon size={18} />
                  </button>
                )}
                <input ref={adicionarRef} type="file" accept="image/*" multiple hidden
                  onChange={e => { adicionarArquivos(Array.from(e.target.files ?? [])); e.target.value = ""; }} />
              </div>
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
