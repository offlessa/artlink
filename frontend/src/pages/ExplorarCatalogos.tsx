import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/api";
import { SearchIcon } from "../components/Icons";
import Footer from "../components/Footer";
import "../styles/components/ExplorarCatalogos.scss";

interface Catalogo {
  id: number;
  nome: string;
  descricao?: string;
  capa?: string;
  capaDinamica?: string;
  posts: { postId: number }[];
  dono: { id: number; nome: string; username: string; fotoPerfil?: string };
}

export default function ExplorarCatalogos() {
  const navigate = useNavigate();
  const [catalogos, setCatalogos] = useState<Catalogo[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState("");

  useEffect(() => {
    async function carregar() {
      try {
        const res = await api.get("/catalogo");
        const dados = Array.isArray(res.data) ? res.data : (res.data?.data ?? []);
        setCatalogos(dados);
      } catch {
        setCatalogos([]);
      } finally {
        setCarregando(false);
      }
    }
    carregar();
  }, []);

  const filtrados = useMemo(() => {
    const q = busca.toLowerCase().trim();
    if (!q) return catalogos;
    return catalogos.filter(c =>
      c.nome.toLowerCase().includes(q) ||
      (c.descricao ?? "").toLowerCase().includes(q) ||
      c.dono.username.toLowerCase().includes(q) ||
      c.dono.nome.toLowerCase().includes(q)
    );
  }, [catalogos, busca]);

  const inicial = (nome: string) => nome.charAt(0).toUpperCase();

  return (
    <div className="exp-cat">
      {/* Cabeçalho */}
      <div className="exp-cat__header">
        <div className="exp-cat__header-inner">
          <h1 className="exp-cat__titulo">Catálogos</h1>
          <p className="exp-cat__subtitulo">Explore coleções criadas por artistas da comunidade</p>

          <div className="exp-cat__busca">
            <SearchIcon size={16} />
            <input
              type="text"
              placeholder="Buscar catálogos, artistas..."
              value={busca}
              onChange={e => setBusca(e.target.value)}
              autoFocus
            />
            {busca && (
              <button className="exp-cat__busca-clear" onClick={() => setBusca("")}>×</button>
            )}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="exp-cat__body">
        {carregando ? (
          <div className="exp-cat__grid">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="exp-cat__skeleton" />
            ))}
          </div>
        ) : filtrados.length === 0 ? (
          <div className="exp-cat__vazio">
            <p>{busca ? `Nenhum catálogo encontrado para "${busca}".` : "Nenhum catálogo ainda."}</p>
          </div>
        ) : (
          <div className="exp-cat__grid">
            {filtrados.map(cat => (
              <div
                key={cat.id}
                className="exp-cat__card"
                onClick={() => navigate(`/catalogo/${cat.id}`)}
              >
                {/* Capa */}
                <div className="exp-cat__capa">
                  {cat.capaDinamica
                    ? <img src={cat.capaDinamica} alt={cat.nome} />
                    : <div className="exp-cat__capa-placeholder" />}

                  {/* Camadas de álbum */}
                  <div className="exp-cat__stack-2" />
                  <div className="exp-cat__stack-1" />

                  {/* Overlay com info */}
                  <div className="exp-cat__overlay">
                    <p className="exp-cat__nome">{cat.nome}</p>
                    <span className="exp-cat__count">
                      {cat.posts.length} item{cat.posts.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>

                {/* Autor */}
                <div className="exp-cat__autor">
                  <div className="exp-cat__avatar">
                    {cat.dono.fotoPerfil
                      ? <img src={cat.dono.fotoPerfil} alt={cat.dono.nome} />
                      : <span>{inicial(cat.dono.nome)}</span>}
                  </div>
                  <div className="exp-cat__autor-info">
                    <span className="exp-cat__autor-nome">{cat.dono.nome}</span>
                    <span className="exp-cat__autor-user">@{cat.dono.username}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
