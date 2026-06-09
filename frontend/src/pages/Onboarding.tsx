import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/api";
import { uploadImagem } from "../api/upload";
import "../styles/components/Onboarding.scss";

const SLIDES = [
  {
    icon: "🎨",
    titulo: "Bem-vindo ao Artlink",
    descricao: "A plataforma feita para artesãos e criadores. Explore posts, catálogos e artistas de todo o Brasil.",
  },
  {
    icon: "📸",
    titulo: "Compartilhe suas criações",
    descricao: "Publique fotos do seu trabalho, organize catálogos e construa seu portfólio online.",
  },
  {
    icon: "🤝",
    titulo: "Conecte-se e colabore",
    descricao: "Siga outros artistas, colabore em projetos e cresça junto com a comunidade.",
  },
];

export default function Onboarding() {
  const { usuario, updateUsuario, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) navigate("/login");
  }, [isAuthenticated]);

  const [etapa, setEtapa] = useState<"tutorial" | "perfil">("tutorial");
  const [slide, setSlide] = useState(0);
  const [animKey, setAnimKey] = useState(0);

  const [bio, setBio] = useState("");
  const [cidade, setCidade] = useState("");
  const [contato, setContato] = useState("");
  const [fotoUrl, setFotoUrl] = useState<string | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function avancarSlide() {
    if (slide < SLIDES.length - 1) {
      setSlide(s => s + 1);
      setAnimKey(k => k + 1);
    } else {
      setEtapa("perfil");
    }
  }

  async function handleFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFotoPreview(URL.createObjectURL(file));
    setUploading(true);
    try {
      const url = await uploadImagem(file);
      setFotoUrl(url);
    } catch {
      // silencioso
    } finally {
      setUploading(false);
    }
  }

  async function salvar() {
    if (!usuario) return navigate("/home");
    setSalvando(true);
    try {
      const updates: Record<string, string> = {};
      if (bio.trim()) updates.bio = bio.trim();
      if (cidade.trim()) updates.cidade = cidade.trim();
      if (contato.trim()) updates.contato = contato.trim();
      if (fotoUrl) updates.fotoPerfil = fotoUrl;

      if (Object.keys(updates).length > 0) {
        await api.put(`/usuario/${usuario.id}`, updates);
        updateUsuario({ ...updates, fotoPerfil: fotoUrl ?? undefined });
      }
    } catch {
      // silencioso — não bloquear a entrada
    } finally {
      navigate("/home");
    }
  }

  const s = SLIDES[slide];
  const ultimo = slide === SLIDES.length - 1;

  if (etapa === "tutorial") {
    return (
      <div className="onb">
        <div className="onb__card">
          <div className="onb__progress">
            {SLIDES.map((_, i) => (
              <div key={i} className={`onb__dot ${i <= slide ? "onb__dot--ativo" : ""}`} />
            ))}
          </div>

          <div className="onb__slide" key={animKey}>
            <span className="onb__icon">{s.icon}</span>
            <h2 className="onb__titulo">{s.titulo}</h2>
            <p className="onb__desc">{s.descricao}</p>
          </div>

          <div className="onb__actions">
            <button className="onb__btn" onClick={avancarSlide}>
              {ultimo ? "Completar perfil →" : "Próximo →"}
            </button>
            <button className="onb__pular" onClick={() => navigate("/home")}>
              Pular
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="onb">
      <div className="onb__card onb__card--perfil">
        <div className="onb__perfil-header">
          <h2 className="onb__titulo">Complete seu perfil</h2>
          <p className="onb__desc">Você pode editar isso depois nas configurações.</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div className="onb__avatar" onClick={() => fileRef.current?.click()}>
            {fotoPreview
              ? <img src={fotoPreview} alt="foto de perfil" />
              : <span className="onb__avatar-inicial">{usuario?.nome?.charAt(0) ?? "?"}</span>
            }
            <div className="onb__avatar-overlay">
              {uploading ? "⏳" : "📷"}
            </div>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleFoto} />
          </div>
          <p className="onb__avatar-hint">Clique para adicionar foto</p>
        </div>

        <div className="onb__campos">
          <div className="onb__campo">
            <label>Bio</label>
            <textarea
              placeholder="Conte um pouco sobre você e seu trabalho..."
              value={bio}
              onChange={e => setBio(e.target.value)}
              maxLength={160}
              rows={3}
            />
            <span className="onb__char">{bio.length}/160</span>
          </div>

          <div className="onb__campo">
            <label>Cidade</label>
            <input
              type="text"
              placeholder="Ex: São Paulo, SP"
              value={cidade}
              onChange={e => setCidade(e.target.value)}
            />
          </div>

          <div className="onb__campo">
            <label>Contato</label>
            <input
              type="text"
              placeholder="WhatsApp, Instagram, e-mail..."
              value={contato}
              onChange={e => setContato(e.target.value)}
            />
          </div>
        </div>

        <div className="onb__actions">
          <button className="onb__btn" onClick={salvar} disabled={salvando || uploading}>
            {salvando ? "Salvando..." : "Entrar no Artlink →"}
          </button>
          <button className="onb__pular" onClick={() => navigate("/home")}>
            Pular por agora
          </button>
        </div>
      </div>
    </div>
  );
}
