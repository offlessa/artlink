import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api/api";
import { uploadImagem } from "../api/upload";
import { useAuth } from "../context/AuthContext";
import Footer from "../components/Footer";
import CreatePostModal from "../components/CreatePostModal";
import {
  ChevronRightIcon, HeartIcon, CommentIcon,
  ImageOffIcon, PlusIcon, TrashIcon, XIcon, CameraIcon, SearchIcon, UsersIcon,
  BookmarkIcon, ShareIcon,
} from "../components/Icons";
import Toast from "../components/Toast";
import ImageEditor from "../components/ImageEditor";
import { copiarLink } from "../utils/compartilhar";
import "../styles/components/CatalogoDetalhe.scss";

interface Post {
  id: number;
  titulo: string;
  imagem?: string;
  curtidas: { id: number }[];
  comentarios: { id: number }[];
  autor: { id: number; nome: string; username: string };
}

interface Imagem {
  id: number;
  imagem: string;
  dataCriacao: string;
}

interface Catalogo {
  id: number;
  nome: string;
  descricao?: string;
  capa?: string;
  usuarioId: number;
  dono: { id: number; nome: string; username: string; fotoPerfil?: string };
}

interface Colaborador {
  usuarioId: number;
  status: "pendente" | "aceito" | "recusado";
  usuario: { id: number; nome: string; username: string; fotoPerfil?: string };
}

interface UsuarioBusca {
  id: number;
  nome: string;
  username: string;
  fotoPerfil?: string;
}

export default function CatalogoDetalhe() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const capaRef = useRef<HTMLInputElement>(null);
  const fotosRef = useRef<HTMLInputElement>(null);
  const addMenuRef = useRef<HTMLDivElement>(null);

  const [catalogo, setCatalogo] = useState<Catalogo | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [imagens, setImagens] = useState<Imagem[]>([]);
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [carregando, setCarregando] = useState(true);

  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [showNewPost, setShowNewPost] = useState(false);
  const [showColabPanel, setShowColabPanel] = useState(false);
  const [capaEditorFile, setCapaEditorFile] = useState<File | null>(null);

  useEffect(() => {
    function fechar(e: MouseEvent) {
      if (addMenuRef.current && !addMenuRef.current.contains(e.target as Node)) {
        setShowAddMenu(false);
      }
    }
    document.addEventListener("mousedown", fechar);
    return () => document.removeEventListener("mousedown", fechar);
  }, []);

  const [todosPosts, setTodosPosts] = useState<Post[]>([]);
  const [buscaPicker, setBuscaPicker] = useState("");
  const [adicionando, setAdicionando] = useState<number | null>(null);
  const [removendo, setRemovendo] = useState<number | null>(null);
  const [removendoImagem, setRemovendoImagem] = useState<number | null>(null);
  const [salvandoCapa, setSalvandoCapa] = useState(false);
  const [uploadandoFotos, setUploadandoFotos] = useState(false);

  const [buscaColab, setBuscaColab] = useState("");
  const [resultadosColab, setResultadosColab] = useState<UsuarioBusca[]>([]);
  const [buscandoColab, setBuscandoColab] = useState(false);
  const [convidando, setConvidando] = useState<number | null>(null);
  const [removendoColab, setRemovendoColab] = useState<number | null>(null);
  const [respondendoConvite, setRespondendoConvite] = useState(false);
  const [salvo, setSalvo] = useState(false);
  const [toast, setToast] = useState("");

  async function carregar() {
    try {
      const resCat = await api.get(`/catalogo/${id}`);
      setCatalogo(resCat.data);
    } catch {
      navigate("/perfil");
      return;
    }
    try {
      const [resPosts, resImagens, resColab] = await Promise.all([
        api.get(`/catalogo/post/${id}`),
        api.get(`/catalogo/imagem/${id}`),
        api.get(`/catalogo/colaboracao/${id}`),
      ]);
      setPosts(Array.isArray(resPosts.data) ? resPosts.data : []);
      setImagens(Array.isArray(resImagens.data) ? resImagens.data : []);
      setColaboradores(Array.isArray(resColab.data) ? resColab.data : []);
    } catch {
      setPosts([]);
      setImagens([]);
      setColaboradores([]);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => { carregar(); }, [id]);

  useEffect(() => {
    if (!usuario || !id) return;
    api.get(`/catalogo-salvo/checar/${usuario.id}/${id}`)
      .then(r => setSalvo(r.data?.salvo ?? false))
      .catch(() => {});
  }, [usuario?.id, id]);

  function mostrarToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  }

  async function toggleSalvar() {
    if (!catalogo || !usuario) { navigate("/login"); return; }
    try {
      if (salvo) {
        await api.delete(`/catalogo-salvo/${usuario.id}/${catalogo.id}`);
        setSalvo(false);
        mostrarToast("Removido dos salvos");
      } else {
        await api.post("/catalogo-salvo", { usuarioId: usuario.id, catalogoId: catalogo.id });
        setSalvo(true);
        mostrarToast("Catálogo salvo!");
      }
    } catch {}
  }

  function compartilhar() {
    copiarLink(`/catalogo/${id}`, mostrarToast);
  }

  // Busca colaboradores com debounce
  useEffect(() => {
    if (!buscaColab.trim()) { setResultadosColab([]); return; }
    const timer = setTimeout(async () => {
      setBuscandoColab(true);
      try {
        const res = await api.get(`/usuario?q=${encodeURIComponent(buscaColab.trim())}`);
        const dados = Array.isArray(res.data) ? res.data : (res.data?.data ?? []);
        const jaConvidados = new Set([
          catalogo?.usuarioId,
          ...colaboradores.map(c => c.usuarioId),
        ]);
        setResultadosColab(dados.filter((u: UsuarioBusca) => !jaConvidados.has(u.id)).slice(0, 6));
      } catch { setResultadosColab([]); }
      finally { setBuscandoColab(false); }
    }, 350);
    return () => clearTimeout(timer);
  }, [buscaColab, colaboradores, catalogo]);

  async function removerPost(e: React.MouseEvent, postId: number) {
    e.stopPropagation();
    setRemovendo(postId);
    try {
      await api.delete(`/catalogo/post/${id}/${postId}`);
      setPosts(p => p.filter(x => x.id !== postId));
    } finally { setRemovendo(null); }
  }

  async function removerImagem(e: React.MouseEvent, imagemId: number) {
    e.stopPropagation();
    setRemovendoImagem(imagemId);
    try {
      await api.delete(`/catalogo/imagem/${imagemId}`);
      setImagens(imgs => imgs.filter(x => x.id !== imagemId));
    } finally { setRemovendoImagem(null); }
  }

  async function abrirPicker() {
    setShowAddMenu(false);
    setBuscaPicker("");
    try {
      const [resMeus, resColab] = await Promise.all([
        api.get(`/post/usuario/${usuario!.id}`),
        api.get(`/post/colaboracao/usuario/${usuario!.id}`),
      ]);
      const meus: Post[] = Array.isArray(resMeus.data) ? resMeus.data : [];
      const colab: Post[] = Array.isArray(resColab.data) ? resColab.data : [];

      // Se for colaborador aceito, também busca posts dos outros colaboradores aceitos
      const colabsAceitos = colaboradores.filter(c => c.status === "aceito");
      const postsDosColabs: Post[] = [];
      for (const c of colabsAceitos) {
        if (c.usuarioId === usuario!.id) continue;
        try {
          const r = await api.get(`/post/usuario/${c.usuarioId}`);
          if (Array.isArray(r.data)) postsDosColabs.push(...r.data);
        } catch { /* silencioso */ }
      }

      const idsVistos = new Set<number>();
      const todos: Post[] = [];
      for (const p of [...meus, ...colab, ...postsDosColabs]) {
        if (!idsVistos.has(p.id)) { idsVistos.add(p.id); todos.push(p); }
      }
      setTodosPosts(todos);
    } catch {
      setTodosPosts([]);
    }
    setShowPicker(true);
  }

  async function adicionarPost(postId: number) {
    setAdicionando(postId);
    try {
      await api.post("/catalogo/post", { catalogoId: Number(id), postId });
      const res = await api.get(`/catalogo/post/${id}`);
      setPosts(Array.isArray(res.data) ? res.data : []);
    } finally { setAdicionando(null); }
  }

  function uploadCapa(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !catalogo) return;
    e.target.value = "";
    setCapaEditorFile(file);
  }

  async function handleCapaEditorConfirm(blob: Blob) {
    if (!catalogo) return;
    const file = new File([blob], "capa.jpg", { type: "image/jpeg" });
    setSalvandoCapa(true);
    try {
      const url = await uploadImagem(file);
      await api.put(`/catalogo/${catalogo.id}`, { capa: url });
      setCatalogo(c => c ? { ...c, capa: url } : c);
    } catch {
      alert("Erro ao salvar a capa.");
    } finally {
      setSalvandoCapa(false);
    }
    setCapaEditorFile(null);
  }

  async function uploadFotos(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length || !catalogo) return;
    e.target.value = "";
    setUploadandoFotos(true);
    try {
      const novas: Imagem[] = [];
      for (const file of files) {
        try {
          const url = await uploadImagem(file);
          const res = await api.post("/catalogo/imagem", { catalogoId: catalogo.id, imagem: url });
          novas.push(res.data);
        } catch { /* pula foto com erro */ }
      }
      if (novas.length) setImagens(imgs => [...imgs, ...novas]);
    } finally {
      setUploadandoFotos(false);
    }
  }

  async function convidarColaborador(userId: number) {
    setConvidando(userId);
    try {
      await api.post("/catalogo/colaboracao", { catalogoId: Number(id), usuarioId: userId });
      const res = await api.get(`/catalogo/colaboracao/${id}`);
      setColaboradores(Array.isArray(res.data) ? res.data : []);
      setBuscaColab("");
      setResultadosColab([]);
    } catch { /* silencioso */ }
    finally { setConvidando(null); }
  }

  async function removerColaborador(userId: number) {
    setRemovendoColab(userId);
    try {
      await api.delete(`/catalogo/colaboracao/${id}/${userId}`);
      setColaboradores(prev => prev.filter(c => c.usuarioId !== userId));
      const resPosts = await api.get(`/catalogo/post/${id}`);
      setPosts(Array.isArray(resPosts.data) ? resPosts.data : []);
    } catch { /* silencioso */ }
    finally { setRemovendoColab(null); }
  }

  async function responderConvite(aceitar: boolean) {
    setRespondendoConvite(true);
    try {
      const acao = aceitar ? "aceitar" : "recusar";
      await api.patch(`/catalogo/colaboracao/${id}/${acao}`);
      if (aceitar) {
        await carregar();
      } else {
        navigate("/perfil");
      }
    } catch { /* silencioso */ }
    finally { setRespondendoConvite(false); }
  }

  if (carregando) return <div className="cat-det__loading">Carregando...</div>;
  if (!catalogo) return null;

  const isDono = usuario?.id === catalogo.usuarioId;
  const minhaColaboracao = colaboradores.find(c => c.usuarioId === usuario?.id);
  const isPendente = minhaColaboracao?.status === "pendente";
  const isColaborador = minhaColaboracao?.status === "aceito";
  const podeEditar = isDono || isColaborador;

  const idsNoCatalogo = new Set(posts.map(p => p.id));

  const postsFiltrados = todosPosts.filter(p => {
    if (idsNoCatalogo.has(p.id)) return false;
    if (!buscaPicker.trim()) return true;
    const q = buscaPicker.toLowerCase();
    return (
      p.titulo.toLowerCase().includes(q) ||
      p.autor.username.toLowerCase().includes(q) ||
      p.autor.nome.toLowerCase().includes(q)
    );
  });

  const statusLabel: Record<string, string> = {
    pendente: "Pendente",
    aceito: "Colaborador",
    recusado: "Recusado",
  };

  return (
    <>
    {capaEditorFile && (
      <ImageEditor
        file={capaEditorFile}
        aspect={16 / 9}
        onConfirm={handleCapaEditorConfirm}
        onCancel={() => setCapaEditorFile(null)}
      />
    )}
    <div className="cat-det">

      {/* ── CAPA ──────────────────────────────────────────────── */}
      <div className="cat-det__capa">
        {catalogo.capa
          ? <img src={catalogo.capa} alt={catalogo.nome} />
          : <div className="cat-det__capa-placeholder" />}
        {isDono && (
          <>
            <button
              className="cat-det__capa-btn"
              onClick={() => capaRef.current?.click()}
              disabled={salvandoCapa}
            >
              <CameraIcon size={14} />
              {salvandoCapa ? "Salvando..." : catalogo.capa ? "Mudar capa" : "Adicionar capa"}
            </button>
            <input ref={capaRef} type="file" accept="image/*" hidden onChange={uploadCapa} />
          </>
        )}
      </div>

      <div className="cat-det__container">
        <button className="cat-det__back" onClick={() => navigate(-1)}>
          <ChevronRightIcon size={13} className="cat-det__back-icon" />
          Voltar
        </button>

        {/* ── BANNER DE CONVITE PENDENTE ───────────────────────── */}
        {isPendente && (
          <div className="cat-det__convite-banner">
            <div className="cat-det__convite-texto">
              <strong>@{catalogo.dono.username}</strong> te convidou para colaborar neste catálogo.
            </div>
            <div className="cat-det__convite-acoes">
              <button
                className="cat-det__convite-aceitar"
                onClick={() => responderConvite(true)}
                disabled={respondendoConvite}
              >
                {respondendoConvite ? "..." : "Aceitar"}
              </button>
              <button
                className="cat-det__convite-recusar"
                onClick={() => responderConvite(false)}
                disabled={respondendoConvite}
              >
                Recusar
              </button>
            </div>
          </div>
        )}

        {/* ── HEADER ─────────────────────────────────────────── */}
        <div className="cat-det__header">
          <div className="cat-det__header-info">
            <h1 className="cat-det__titulo">{catalogo.nome}</h1>
            {catalogo.descricao && <p className="cat-det__desc">{catalogo.descricao}</p>}
            <p className="cat-det__meta">
              por @{catalogo.dono.username}
              {isColaborador && <span className="cat-det__colab-badge"> · você colabora</span>}
              {" "}· {posts.length} publicaç{posts.length !== 1 ? "ões" : "ão"}
              {imagens.length > 0 && ` · ${imagens.length} foto${imagens.length !== 1 ? "s" : ""}`}
            </p>

            {/* Avatares dos colaboradores aceitos */}
            {colaboradores.filter(c => c.status === "aceito").length > 0 && (
              <div className="cat-det__colab-avatares">
                {colaboradores.filter(c => c.status === "aceito").map(c => (
                  <div key={c.usuarioId} className="cat-det__colab-avatar" title={`@${c.usuario.username}`}>
                    {c.usuario.fotoPerfil
                      ? <img src={c.usuario.fotoPerfil} alt={c.usuario.nome} />
                      : <span>{c.usuario.nome.charAt(0).toUpperCase()}</span>}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="cat-det__header-acoes">
            {/* Salvar e Compartilhar */}
            <button
              className={`cat-det__icon-btn ${salvo ? "cat-det__icon-btn--ativo" : ""}`}
              onClick={toggleSalvar}
              title={salvo ? "Remover dos salvos" : "Salvar catálogo"}
            >
              <BookmarkIcon size={15} filled={salvo} />
            </button>
            <button
              className="cat-det__icon-btn"
              onClick={compartilhar}
              title="Compartilhar"
            >
              <ShareIcon size={15} />
            </button>

            {/* Botão gerenciar colaboradores (dono) */}
            {isDono && (
              <button
                className="cat-det__colab-btn"
                onClick={() => setShowColabPanel(v => !v)}
                title="Colaboradores"
              >
                <UsersIcon size={14} />
                Colaboradores
                {colaboradores.filter(c => c.status === "pendente").length > 0 && (
                  <span className="cat-det__colab-badge-count">
                    {colaboradores.filter(c => c.status === "pendente").length}
                  </span>
                )}
              </button>
            )}

            {/* Excluir catálogo (dono) */}
            {isDono && (
              <button
                className="cat-det__excluir-btn"
                onClick={async () => {
                  if (!confirm("Excluir este catálogo permanentemente? Esta ação não pode ser desfeita.")) return;
                  try {
                    await api.delete(`/catalogo/${catalogo.id}`);
                    navigate("/perfil");
                  } catch {
                    mostrarToast("Erro ao excluir catálogo.");
                  }
                }}
                title="Excluir catálogo"
              >
                <TrashIcon size={14} />
                Excluir
              </button>
            )}

            {/* Sair do catálogo (colaborador aceito) */}
            {isColaborador && (
              <button
                className="cat-det__sair-btn"
                onClick={() => {
                  if (confirm("Sair do catálogo? Seus posts serão removidos dele.")) {
                    removerColaborador(usuario!.id);
                  }
                }}
              >
                Sair do catálogo
              </button>
            )}

            {/* Adicionar conteúdo (dono ou colaborador aceito) */}
            {podeEditar && (
              <div className="cat-det__add-wrap" ref={addMenuRef}>
                <button
                  className="cat-det__add-btn"
                  onClick={() => setShowAddMenu(v => !v)}
                >
                  <PlusIcon size={14} /> Adicionar
                </button>
                {showAddMenu && (
                  <div className="cat-det__add-menu">
                    {isDono && (
                      <button onClick={() => { setShowAddMenu(false); fotosRef.current?.click(); }}>
                        Fotos diretas
                      </button>
                    )}
                    <button onClick={() => { setShowAddMenu(false); setShowNewPost(true); }}>
                      Nova publicação
                    </button>
                    <button onClick={() => { setShowAddMenu(false); abrirPicker(); }}>
                      Buscar publicações
                    </button>
                  </div>
                )}
                {isDono && (
                  <input
                    ref={fotosRef}
                    type="file"
                    accept="image/*"
                    multiple
                    hidden
                    onChange={uploadFotos}
                  />
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── PAINEL DE COLABORADORES ────────────────────────── */}
        {showColabPanel && isDono && (
          <div className="cat-det__colab-panel">
            <div className="cat-det__colab-panel-header">
              <span>Colaboradores</span>
              <button onClick={() => setShowColabPanel(false)}><XIcon size={16} /></button>
            </div>

            {/* Busca para convidar */}
            <div className="cat-det__colab-busca">
              <SearchIcon size={14} />
              <input
                type="text"
                placeholder="Buscar artista pelo username..."
                value={buscaColab}
                onChange={e => setBuscaColab(e.target.value)}
              />
            </div>

            {buscandoColab && <p className="cat-det__colab-buscando">Buscando...</p>}

            {resultadosColab.length > 0 && (
              <div className="cat-det__colab-resultados">
                {resultadosColab.map(u => (
                  <div key={u.id} className="cat-det__colab-resultado">
                    <div className="cat-det__colab-resultado-avatar">
                      {u.fotoPerfil
                        ? <img src={u.fotoPerfil} alt={u.nome} />
                        : <span>{u.nome.charAt(0).toUpperCase()}</span>}
                    </div>
                    <div className="cat-det__colab-resultado-info">
                      <span className="cat-det__colab-resultado-nome">{u.nome}</span>
                      <span className="cat-det__colab-resultado-user">@{u.username}</span>
                    </div>
                    <button
                      className="cat-det__colab-convidar"
                      onClick={() => convidarColaborador(u.id)}
                      disabled={convidando === u.id}
                    >
                      {convidando === u.id ? "..." : "Convidar"}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Lista de colaboradores */}
            {colaboradores.length === 0 ? (
              <p className="cat-det__colab-vazio">Nenhum colaborador ainda.</p>
            ) : (
              <div className="cat-det__colab-lista">
                {colaboradores.map(c => (
                  <div key={c.usuarioId} className="cat-det__colab-item">
                    <div className="cat-det__colab-item-avatar">
                      {c.usuario.fotoPerfil
                        ? <img src={c.usuario.fotoPerfil} alt={c.usuario.nome} />
                        : <span>{c.usuario.nome.charAt(0).toUpperCase()}</span>}
                    </div>
                    <div className="cat-det__colab-item-info">
                      <span className="cat-det__colab-item-nome">{c.usuario.nome}</span>
                      <span className="cat-det__colab-item-user">@{c.usuario.username}</span>
                    </div>
                    <span className={`cat-det__colab-status cat-det__colab-status--${c.status}`}>
                      {statusLabel[c.status]}
                    </span>
                    <button
                      className="cat-det__colab-remover"
                      onClick={() => removerColaborador(c.usuarioId)}
                      disabled={removendoColab === c.usuarioId}
                      title="Remover colaborador"
                    >
                      <XIcon size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── GALERIA DE FOTOS DIRETAS ───────────────────────── */}
        {(imagens.length > 0 || uploadandoFotos) && (
          <div className="cat-det__fotos-section">
            <p className="cat-det__section-label">
              Fotos
              {uploadandoFotos && <span className="cat-det__uploading"> Enviando...</span>}
            </p>
            <div className="cat-det__fotos-grid">
              {imagens.map(img => (
                <div key={img.id} className="cat-det__foto">
                  <img src={img.imagem} alt="" />
                  {isDono && (
                    <button
                      className="cat-det__foto-del"
                      onClick={e => removerImagem(e, img.id)}
                      disabled={removendoImagem === img.id}
                      title="Remover foto"
                    >
                      <TrashIcon size={12} />
                    </button>
                  )}
                </div>
              ))}
              {uploadandoFotos && (
                <div className="cat-det__foto cat-det__foto--loading">
                  <span>Enviando...</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── PUBLICAÇÕES ────────────────────────────────────── */}
        {posts.length > 0 && (
          <p className="cat-det__section-label" style={{ marginTop: imagens.length > 0 ? "2rem" : 0 }}>
            Publicações
          </p>
        )}

        {posts.length === 0 && imagens.length === 0 ? (
          <div className="cat-det__empty">
            <p>Este catálogo ainda não tem nada.</p>
            {podeEditar && (
              <div className="cat-det__empty-actions">
                {isDono && (
                  <button className="cat-det__empty-btn" onClick={() => fotosRef.current?.click()}>
                    <PlusIcon size={14} /> Adicionar fotos
                  </button>
                )}
                <button className="cat-det__empty-btn cat-det__empty-btn--outline" onClick={abrirPicker}>
                  <PlusIcon size={14} /> Buscar publicações
                </button>
              </div>
            )}
          </div>
        ) : posts.length > 0 ? (
          <div className="cat-det__grid">
            {posts.map(post => (
              <div key={post.id} className="cat-det__card" onClick={() => navigate(`/post/${post.id}`)}>
                <div className="cat-det__card-img">
                  {post.imagem
                    ? <img src={post.imagem} alt={post.titulo} />
                    : <div className="cat-det__no-img"><ImageOffIcon size={24} /></div>}
                </div>
                <div className="cat-det__card-info">
                  <span className="cat-det__card-titulo">{post.titulo}</span>
                  <div className="cat-det__card-row">
                    <span className="cat-det__card-stats">
                      <HeartIcon size={11} filled /> {post.curtidas.length}
                      &nbsp;&nbsp;<CommentIcon size={11} /> {post.comentarios.length}
                    </span>
                    {podeEditar && (post.autor.id === usuario?.id || isDono) && (
                      <button
                        className="cat-det__card-del"
                        onClick={e => removerPost(e, post.id)}
                        disabled={removendo === post.id}
                        title="Remover do catálogo"
                      >
                        <TrashIcon size={13} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      {/* ── PICKER MODAL ──────────────────────────────────────── */}
      {showPicker && (
        <div className="cat-det__picker-overlay" onClick={e => { if (e.target === e.currentTarget) setShowPicker(false); }}>
          <div className="cat-det__picker">
            <div className="cat-det__picker-header">
              <span>Adicionar publicação</span>
              <button onClick={() => setShowPicker(false)}><XIcon size={18} /></button>
            </div>
            <div className="cat-det__picker-search">
              <SearchIcon size={15} />
              <input
                type="text"
                placeholder="Buscar por título ou artista..."
                value={buscaPicker}
                onChange={e => setBuscaPicker(e.target.value)}
                autoFocus
              />
            </div>
            {postsFiltrados.length === 0 ? (
              <p className="cat-det__picker-empty">
                {idsNoCatalogo.size === todosPosts.length
                  ? "Todas as publicações já estão neste catálogo."
                  : "Nenhuma publicação encontrada."}
              </p>
            ) : (
              <div className="cat-det__picker-grid">
                {postsFiltrados.map(post => (
                  <button
                    key={post.id}
                    className={`cat-det__picker-item ${adicionando === post.id ? "cat-det__picker-item--adding" : ""}`}
                    onClick={() => adicionarPost(post.id)}
                    disabled={adicionando === post.id}
                  >
                    <div className="cat-det__picker-img">
                      {post.imagem
                        ? <img src={post.imagem} alt={post.titulo} />
                        : <div className="cat-det__picker-noimg"><ImageOffIcon size={20} /></div>}
                      {adicionando === post.id && (
                        <div className="cat-det__picker-adding">+</div>
                      )}
                    </div>
                    <span className="cat-det__picker-title">{post.titulo}</span>
                    <span className="cat-det__picker-author">@{post.autor.username}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {toast && <Toast mensagem={toast} visivel={!!toast} onFadeOut={() => setToast("")} />}

      {showNewPost && (
        <CreatePostModal
          catalogoId={Number(id)}
          onClose={() => setShowNewPost(false)}
          onSuccess={carregar}
        />
      )}

      <Footer />
    </div>
    </>
  );
}
