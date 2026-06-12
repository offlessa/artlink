import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useI18n } from "../hooks/useI18n";
import "../styles/components/Login.scss";

const RAIO = 200;

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const t = useI18n();

  useEffect(() => {
    if (!isAuthenticated) return;
    const isNovo = sessionStorage.getItem("@artlink:novo");
    navigate(isNovo ? "/onboarding" : "/home");
  }, [isAuthenticated]);

  const [email, setEmail] = useState(() => localStorage.getItem("@artlink:lembrar-email") ?? "");
  const [senha, setSenha] = useState(() => localStorage.getItem("@artlink:lembrar-senha") ?? "");
  const [lembrar, setLembrar] = useState(() => !!localStorage.getItem("@artlink:lembrar-email"));
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);

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
    setErro("");
    setCarregando(true);
    if (lembrar) {
      localStorage.setItem("@artlink:lembrar-email", email);
      localStorage.setItem("@artlink:lembrar-senha", senha);
    } else {
      localStorage.removeItem("@artlink:lembrar-email");
      localStorage.removeItem("@artlink:lembrar-senha");
    }
    try {
      await login(email, senha, lembrar);
    } catch (err: any) {
      setErro(err?.response?.data?.message || t.login.invalidCredentials);
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
            <div className="auth-panel__brand">
              <img src="/artlink-icon.png" className="auth-panel__brand-icon" alt="" />
              <Link to="/" className="auth-panel__logo">Artlink</Link>
              <span className="auth-panel__brand-sub">online gallery</span>
            </div>
            <div className="auth-panel__deco" />
            <p className="auth-panel__tagline">
              {t.login.tagline1}<br />{t.login.tagline2}
            </p>
            <div
              className="auth-panel__texto-overlay"
              style={{ WebkitMaskImage: spotlightMask, maskImage: spotlightMask }}
              aria-hidden="true"
            >
              <div className="auth-panel__brand">
                <img src="/artlink-icon.png" className="auth-panel__brand-icon" alt="" />
                <span className="auth-panel__logo">Artlink</span>
                <span className="auth-panel__brand-sub">online gallery</span>
              </div>
              <div className="auth-panel__deco" />
              <p className="auth-panel__tagline">
                {t.login.tagline1}<br />{t.login.tagline2}
              </p>
            </div>
          </div>

        </div>
      </div>

      <div className="auth-form-side">
        <div className="auth-box">
          <div className="auth-box__header">
            <div className="auth-box__logo-mobile">
              <div className="auth-box__mobile-icon-wrap">
                <img src="/artlink-icon.png" alt="" />
              </div>
              <div>
                <Link to="/" className="auth-box__mobile-nome">Artlink</Link>
                <div className="auth-box__mobile-sub">online gallery</div>
              </div>
            </div>
            <h1 className="auth-box__title">{t.login.welcome}</h1>
            <p className="auth-box__subtitle">{t.login.subtitle}</p>
          </div>

          {erro && <div className="auth-box__error">{erro}</div>}

          <form className="auth-form" onSubmit={handleSubmit}>
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
              <label className="auth-form__label">{t.login.email}</label>
            </div>

            <div className="auth-form__field auth-form__field--float">
              <input
                className="auth-form__input"
                type={mostrarSenha ? "text" : "password"}
                placeholder=" "
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
                autoComplete="current-password"
                style={{ paddingRight: 42 }}
              />
              <label className="auth-form__label">{t.login.password}</label>
              <button
                type="button"
                className="auth-form__toggle-senha"
                onClick={() => setMostrarSenha(v => !v)}
                tabIndex={-1}
                aria-label={mostrarSenha ? "Ocultar senha" : "Ver senha"}
              >
                {mostrarSenha ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>

            <div className="auth-form__row">
              <label className="auth-form__lembrar">
                <input
                  type="checkbox"
                  checked={lembrar}
                  onChange={(e) => setLembrar(e.target.checked)}
                />
                <span>{t.login.remember}</span>
              </label>
              <Link to="/esqueci-senha" className="auth-form__forgot-link">
                {t.login.forgotPassword}
              </Link>
            </div>

            <div className="auth-form__actions">
              <button className="auth-form__btn" type="submit" disabled={carregando}>
                {carregando ? t.login.signingIn : t.login.signIn}
              </button>
              <Link to="/cadastro" className="auth-form__btn-outline">
                {t.login.createAccount}
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
