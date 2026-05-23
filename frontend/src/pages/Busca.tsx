import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { api } from "../api/api";
import PostCard from "../components/PostCard";
import Footer from "../components/Footer";
import { SearchIcon } from "../components/Icons";
import "../styles/components/Busca.scss";

interface Post {
  id: number; titulo: string; descricao?: string; imagem?: string;
  curtidas: { id: number; usuarioId: number }[]; comentarios: { id: number }[];
  autor: { id: number; nome: string; username: string; fotoPerfil?: string };
}
interface Usuario {
  id: number; nome: string; username: string; bio?: string; fotoPerfil?: string;
}

type Aba = "arte" | "artistas";

export default function Busca() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [busca, setBusca] = useState(searchParams.get("q") ?? "");
  const [aba, setAba] = useState<Aba>((searchParams.get("tab") as Aba) ?? "arte");
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/post").catch(() => ({ data: [] })),
      api.get("/usuario").catch(() => ({ data: [] })),
    ]).then(([rp, ru]) => {
      setPosts(Array.isArray(rp.data) ? rp.data : []);
      setUsuarios(Array.isArray(ru.data) ? ru.data : []);
    }).finally(() => setCarregando(false));
  }, []);

  useEffect(() => {
    const q = searchParams.get("q") ?? "";
    const tab = (searchParams.get("tab") as Aba) ?? "arte";
    setBusca(q);
    setAba(tab);
  }, [searchParams]);

  function handleAba(a: Aba) {
    setAba(a);
    setSearchParams(prev => { prev.set("tab", a); return prev; });
  }

  const termo = busca.trim().toLowerCase();

  const postsFiltrados = termo
    ? posts.filter(p =>
        p.titulo.toLowerCase().includes(termo) ||
        (p.descricao ?? "").toLowerCase().includes(termo) ||
        p.autor.nome.toLowerCase().includes(termo) ||
        p.autor.username.toLowerCase().includes(termo))
    : posts;

  const usersFiltrados = termo
    ? usuarios.filter(u =>
        u.nome.toLowerCase().includes(termo) ||
        u.username.toLowerCase().includes(termo))
    : usuarios;

  function recarregar() {
    api.get("/post").then(r => setPosts(Array.isArray(r.data) ? r.data : []));
  }

  return (
    <div className="busca">
      <div className="busca__header">
        <span className="busca__label">Pesquisar</span>
        <div className="busca__input-wrapper">
          <SearchIcon size={16} className="busca__icon" />
          <input
            className="busca__input"
            type="text"
            placeholder="Título, artista, técnica..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
            autoFocus
          />
          {busca && <button className="busca__clear" onClick={() => setBusca("")}>&times;</button>}
        </div>

        <div className="busca__abas">
          <button className={aba === "arte" ? "active" : ""} onClick={() => handleAba("arte")}>
            Arte {!carregando && <span>{postsFiltrados.length}</span>}
          </button>
          <button className={aba === "artistas" ? "active" : ""} onClick={() => handleAba("artistas")}>
            Artistas {!carregando && <span>{usersFiltrados.length}</span>}
          </button>
        </div>
      </div>

      <div className="busca__body">
        {carregando ? (
          <div className="busca__empty"><p>Carregando...</p></div>
        ) : aba === "arte" ? (
          postsFiltrados.length === 0 ? (
            <div className="busca__empty">
              <SearchIcon size={40} className="busca__empty-icon" />
              <p>Nenhum resultado encontrado</p>
              <small>Tente buscar por outro título ou artista</small>
            </div>
          ) : (
            <div className="busca__grid">
              {postsFiltrados.map(post => (
                <PostCard
                  key={post.id}
                  id={post.id}
                  titulo={post.titulo}
                  imagem={post.imagem}
                  curtidas={post.curtidas}
                  autor={post.autor}
                  onCurtidaChange={recarregar}
                />
              ))}
            </div>
          )
        ) : (
          usersFiltrados.length === 0 ? (
            <div className="busca__empty">
              <SearchIcon size={40} className="busca__empty-icon" />
              <p>Nenhum artista encontrado</p>
              <small>Tente buscar por outro nome ou @username</small>
            </div>
          ) : (
            <div className="busca__users">
              {usersFiltrados.map(u => (
                <div key={u.id} className="busca__user-card" onClick={() => navigate(`/u/${u.username}`)}>
                  <div className="busca__user-av">
                    {u.fotoPerfil
                      ? <img src={u.fotoPerfil} alt={u.nome} />
                      : <span>{u.nome.charAt(0).toUpperCase()}</span>}
                  </div>
                  <div className="busca__user-info">
                    <p className="busca__user-nome">{u.nome}</p>
                    <span className="busca__user-user">@{u.username}</span>
                    {u.bio && <p className="busca__user-bio">{u.bio}</p>}
                  </div>
                  <button className="busca__user-ver">Ver perfil</button>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      <Footer />
    </div>
  );
}
