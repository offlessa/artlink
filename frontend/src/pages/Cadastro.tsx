import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useI18n } from "../hooks/useI18n";
import { api } from "../api/api";
import "../styles/components/Login.scss";

const FOTOS = [
  "/ChatGPT Image 22 de mai. de 2026, 14_06_46.png",
  "/12d65a66-950a-4912-885c-381d3b8aad1e.png",
  "/ChatGPT Image 22 de mai. de 2026, 14_08_28.png",
];

const RAIO = 200;

export default function Cadastro() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const t = useI18n();

  useEffect(() => {
    if (isAuthenticated) navigate("/home");
  }, [isAuthenticated]);

  const [nome, setNome] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState(false);
  const [carregando, setCarregando] = useState(false);

  const [pos, setPos] = useState({ x: -999, y: -999 });
  const [textoOffset, setTextoOffset] = useState({ left: 0, top: 0 });
  const textoRef = useRef<HTMLDivElement>(null);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const panelRect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - panelRect.left;
    const y = e.clientY - panelRect.top;
    setPos({ x, y });
    if (textoRef.current) {
      const r = textoRef.current.getBoundingClientRect();
      setTextoOffset({ left: r.left - panelRect.left, top: r.top - panelRect.top });
    }
  }

  function handleMouseLeave() {
    setPos({ x: -999, y: -999 });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMensagem("");
    setErro(false);
    setCarregando(true);
    try {
      const { data } = await api.post("/usuario", { nome, username, email, senha });
      if (data.success) {
        await login(email, senha, true);
      } else {
        setErro(true);
        setMensagem(data.message || t.signup.error);
      }
    } catch {
      setErro(true);
      setMensagem(t.signup.serverError);
    } finally {
      setCarregando(false);
    }
  }

  const veilMask = `radial-gradient(circle ${RAIO}px at ${pos.x}px ${pos.y}px, transparent 0%, transparent 25%, rgba(0,0,0,0.4) 55%, black 80%)`;
  const warmthBg = `radial-gradient(circle ${RAIO * 0.85}px at ${pos.x}px ${pos.y}px, rgba(190,145,55,0.18) 0%, transparent 70%)`;
  const tx = pos.x - textoOffset.left;
  const ty = pos.y - textoOffset.top;
  const spotlightMask = `radial-gradient(circle ${RAIO}px at ${tx}px ${ty}px, black 0%, black 45%, transparent 65%)`;

  return (
    <div className="auth-page">
      <div
        className="auth-panel"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div className="auth-panel__reveal" />
        <div className="auth-panel__veil" style={{ WebkitMaskImage: veilMask, maskImage: veilMask }} />
        <div className="auth-panel__warmth" style={{ background: warmthBg }} />

        <div className="auth-panel__content">
          <div ref={textoRef} className="auth-panel__texto">
            <Link to="/" className="auth-panel__logo">Artlink</Link>
            <div className="auth-panel__deco" />
            <p className="auth-panel__tagline">
              {t.signup.tagline1}<br />{t.signup.tagline2}
            </p>
            <div
              className="auth-panel__texto-overlay"
              style={{ WebkitMaskImage: spotlightMask, maskImage: spotlightMask }}
              aria-hidden="true"
            >
              <span className="auth-panel__logo">Artlink</span>
              <div className="auth-panel__deco" />
              <p className="auth-panel__tagline">
                {t.signup.tagline1}<br />{t.signup.tagline2}
              </p>
            </div>
          </div>

          <div className="auth-panel__fotos">
            {FOTOS.map((src, i) => (
              <div key={i} className={`auth-panel__foto auth-panel__foto--${i}`}>
                <img src={src} alt="artesanato" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="auth-form-side">
        <div className="auth-box">
          <div className="auth-box__header">
            <Link to="/" className="auth-box__logo-mobile">Artlink</Link>
            <h1 className="auth-box__title">{t.signup.title}</h1>
            <p className="auth-box__subtitle">{t.signup.subtitle}</p>
          </div>

          {mensagem && (
            <div className={erro ? "auth-box__error" : "auth-box__success"}>
              {mensagem}
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-form__field auth-form__field--float">
              <input
                className="auth-form__input"
                type="text"
                placeholder=" "
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
                autoComplete="name"
              />
              <label className="auth-form__label">{t.signup.fullName}</label>
            </div>
            <div className="auth-form__field auth-form__field--float">
              <input
                className="auth-form__input"
                type="text"
                placeholder=" "
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
              />
              <label className="auth-form__label">{t.signup.username}</label>
            </div>
            <div className="auth-form__field auth-form__field--float">
              <input
                className="auth-form__input"
                type="email"
                placeholder=" "
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
              <label className="auth-form__label">{t.signup.email}</label>
            </div>
            <div className="auth-form__field auth-form__field--float">
              <input
                className="auth-form__input"
                type="password"
                placeholder=" "
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
                autoComplete="new-password"
              />
              <label className="auth-form__label">{t.signup.password}</label>
            </div>

            <div className="auth-form__actions">
              <button className="auth-form__btn" type="submit" disabled={carregando}>
                {carregando ? t.signup.creating : t.signup.createAccount}
              </button>
              <Link to="/login" className="auth-form__btn-outline">
                {t.signup.hasAccount}
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
