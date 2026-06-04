import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/api";
import { useAuth } from "../context/AuthContext";
import Footer from "../components/Footer";
import "../styles/components/Artistas.scss";

interface CatalogoPreview {
  id: number;
  nome: string;
  capaDinamica: string | null;
}

interface Artista {
  id: number;
  nome: string;
  username: string;
  fotoPerfil?: string;
  fotoCapa?: string;
  bio?: string;
  seguidores: number;
  totalPosts: number;
  catalogos: CatalogoPreview[];
}

function formatarSeguidores(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(".0", "")}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1).replace(".0", "")}K`;
  return String(n);
}

export default function Artistas() {
  const { usuario } = useAuth();
  const navigate = useNavigate();

  const [artistas, setArtistas] = useState<Artista[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [seguindo, setSeguindo] = useState<Set<number>>(new Set());
  const [loadingSeguir, setLoadingSeguir] = useState<number | null>(null);

  useEffect(() => {
    carregar();
  }, [usuario?.id]);

  async function carregar() {
    setCarregando(true);
    try {
      const res = await api.get("/usuario/artistas");
      const dados: Artista[] = Array.isArray(res.data) ? res.data : [];
      // Filtra o próprio usuário
      setArtistas(dados.filter(a => a.id !== usuario?.id));

      // Descobre quem já segue
      if (usuario) {
        const checks = await Promise.allSettled(
          dados.filter(a => a.id !== usuario.id).map(a =>
            api.get(`/seguidor/checar/${usuario.id}/${a.id}`)
          )
        );
        const ids = new Set<number>();
        checks.forEach((r, i) => {
          const seg = r.status === "fulfilled"
            ? (r.value.data?.data?.seguindo ?? r.value.data?.seguindo ?? false)
            : false;
          if (seg) ids.add(dados.filter(a => a.id !== usuario.id)[i].id);
        });
        setSeguindo(ids);
      }
    } catch {
      setArtistas([]);
    } finally {
      setCarregando(false);
    }
  }

  async function toggleSeguir(e: React.MouseEvent, artistaId: number) {
    e.stopPropagation();
    if (!usuario) { navigate("/login"); return; }
    setLoadingSeguir(artistaId);
    try {
      if (seguindo.has(artistaId)) {
        await api.delete(`/seguidor/${usuario.id}/${artistaId}`);
        setSeguindo(prev => { const s = new Set(prev); s.delete(artistaId); return s; });
        setArtistas(prev => prev.map(a =>
          a.id === artistaId ? { ...a, seguidores: Math.max(0, a.seguidores - 1) } : a
        ));
      } else {
        await api.post("/seguidor", { seguidorId: usuario.id, seguidoId: artistaId });
        setSeguindo(prev => new Set(prev).add(artistaId));
        setArtistas(prev => prev.map(a =>
          a.id === artistaId ? { ...a, seguidores: a.seguidores + 1 } : a
        ));
      }
    } catch { /* silencioso */ }
    finally { setLoadingSeguir(null); }
  }

  const inicial = (nome: string) => nome.charAt(0).toUpperCase();

  return (
    <div className="artistas">
      <div className="artistas__header">
        <h1 className="artistas__titulo">Artistas</h1>
        <p className="artistas__sub">Descubra criadores por relevância</p>
      </div>

      <div className="artistas__body">
        {carregando ? (
          <div className="artistas__grid">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="artistas__skeleton" />
            ))}
          </div>
        ) : artistas.length === 0 ? (
          <div className="artistas__vazio">
            <p>Nenhum artista encontrado.</p>
          </div>
        ) : (
          <div className="artistas__grid">
            {artistas.map(artista => (
              <div key={artista.id} className="artistas__card">
                {/* Banner de fundo */}
                <div
                  className="artistas__banner"
                  onClick={() => navigate(`/u/${artista.username}`)}
                >
                  {artista.fotoCapa
                    ? <img src={artista.fotoCapa} alt="" className="artistas__banner-img" />
                    : <div className="artistas__banner-placeholder" />}
                  <div className="artistas__banner-overlay" />
                </div>

                {/* Avatar sobre o banner */}
                <div
                  className="artistas__avatar-wrap"
                  onClick={() => navigate(`/u/${artista.username}`)}
                >
                  <div className="artistas__avatar">
                    {artista.fotoPerfil
                      ? <img src={artista.fotoPerfil} alt={artista.nome} />
                      : <span>{inicial(artista.nome)}</span>}
                  </div>
                </div>

                {/* Info */}
                <div className="artistas__info">
                  <button
                    className="artistas__nome"
                    onClick={() => navigate(`/u/${artista.username}`)}
                  >
                    {artista.nome}
                  </button>

                  <span className="artistas__seguidores">
                    {formatarSeguidores(artista.seguidores)} seguidores
                    {artista.totalPosts > 0 && (
                      <> · {artista.totalPosts} post{artista.totalPosts !== 1 ? "s" : ""}</>
                    )}
                  </span>

                  {artista.bio && (
                    <p className="artistas__bio">{artista.bio}</p>
                  )}

                  {/* Botão seguir */}
                  {usuario && (
                    <button
                      className={`artistas__seguir ${seguindo.has(artista.id) ? "artistas__seguir--ativo" : ""}`}
                      onClick={e => toggleSeguir(e, artista.id)}
                      disabled={loadingSeguir === artista.id}
                    >
                      {loadingSeguir === artista.id
                        ? "..."
                        : seguindo.has(artista.id) ? "Seguindo" : "Seguir"}
                    </button>
                  )}
                </div>

                {/* Catálogos do artista */}
                {artista.catalogos.length > 0 && (
                  <div className="artistas__catalogos">
                    <span className="artistas__catalogos-label">Catálogos</span>
                    <div className="artistas__catalogos-row">
                      {artista.catalogos.map(cat => (
                        <div
                          key={cat.id}
                          className="artistas__cat-thumb"
                          onClick={() => navigate(`/catalogo/${cat.id}`)}
                          title={cat.nome}
                        >
                          {cat.capaDinamica
                            ? <img src={cat.capaDinamica} alt={cat.nome} />
                            : <div className="artistas__cat-placeholder" />}
                          <span className="artistas__cat-nome">{cat.nome}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
