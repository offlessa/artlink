import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useI18n } from "../hooks/useI18n";
import { api } from "../api/api";
import "../styles/components/Login.scss";

const FOTOS = [
  "/ChatGPT Image 22 de mai. de 2026, 14_06_46.png",
  "/12d65a66-950a-4912-885c-381d3b8aad1e.png",
  "/ChatGPT Image 22 de mai. de 2026, 14_08_28.png",
];

const RAIO = 200;

export default function EsqueciSenha() {
  const navigate = useNavigate();
  const t = useI18n();
  const [passo, setPasso] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [codigo, setCodigo] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
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

  async function handleEnviarCodigo(e: React.FormEvent) {
    e.preventDefault();
    setMensagem("");
    setErro(false);
    setCarregando(true);
    try {
      await api.post("/auth/esqueci-senha", { email });
      setMensagem(t.forgotPassword.codeSent);
      setPasso(2);
    } catch (err: any) {
      setErro(true);
      setMensagem(err?.response?.data?.message || t.forgotPassword.sendError);
    } finally {
      setCarregando(false);
    }
  }

  async function handleRedefinir(e: React.FormEvent) {
    e.preventDefault();
    setMensagem("");
    setErro(false);

    if (novaSenha !== confirmarSenha) {
      setErro(true);
      setMensagem(t.forgotPassword.passwordMismatch);
      return;
    }

    setCarregando(true);
    try {
      await api.post("/auth/redefinir-senha", { email, codigo, novaSenha });
      setMensagem(t.forgotPassword.success);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err: any) {
      setErro(true);
      setMensagem(err?.response?.data?.message || t.forgotPassword.invalidCode);
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
              {t.login.tagline1}<br />{t.login.tagline2}
            </p>
            <div
              className="auth-panel__texto-overlay"
              style={{ WebkitMaskImage: spotlightMask, maskImage: spotlightMask }}
              aria-hidden="true"
            >
              <span className="auth-panel__logo">Artlink</span>
              <div className="auth-panel__deco" />
              <p className="auth-panel__tagline">
                {t.login.tagline1}<br />{t.login.tagline2}
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
          {passo === 1 ? (
            <>
              <div className="auth-box__header">
                <Link to="/" className="auth-box__logo-mobile">Artlink</Link>
                <h1 className="auth-box__title">{t.forgotPassword.title}</h1>
                <p className="auth-box__subtitle">{t.forgotPassword.subtitle}</p>
              </div>

              {mensagem && (
                <div className={erro ? "auth-box__error" : "auth-box__success"}>
                  {mensagem}
                </div>
              )}

              <form className="auth-form" onSubmit={handleEnviarCodigo}>
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
                  <label className="auth-form__label">{t.forgotPassword.email}</label>
                </div>

                <div className="auth-form__actions">
                  <button className="auth-form__btn" type="submit" disabled={carregando}>
                    {carregando ? t.forgotPassword.sending : t.forgotPassword.sendCode}
                  </button>
                  <Link to="/login" className="auth-form__btn-outline">
                    {t.forgotPassword.backToLogin}
                  </Link>
                </div>
              </form>
            </>
          ) : (
            <>
              <div className="auth-box__header">
                <Link to="/" className="auth-box__logo-mobile">Artlink</Link>
                <h1 className="auth-box__title">{t.forgotPassword.resetTitle}</h1>
                <p className="auth-box__subtitle">{t.forgotPassword.resetSubtitle(email)}</p>
              </div>

              {mensagem && (
                <div className={erro ? "auth-box__error" : "auth-box__success"}>
                  {mensagem}
                </div>
              )}

              <form className="auth-form" onSubmit={handleRedefinir}>
                <div className="auth-form__field auth-form__field--float">
                  <input
                    className="auth-form__input auth-form__input--code"
                    type="text"
                    placeholder=" "
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    required
                    maxLength={6}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                  />
                  <label className="auth-form__label">{t.forgotPassword.code}</label>
                </div>

                <div className="auth-form__field auth-form__field--float">
                  <input
                    className="auth-form__input"
                    type="password"
                    placeholder=" "
                    value={novaSenha}
                    onChange={(e) => setNovaSenha(e.target.value)}
                    required
                    autoComplete="new-password"
                  />
                  <label className="auth-form__label">{t.forgotPassword.newPassword}</label>
                </div>

                <div className="auth-form__field auth-form__field--float">
                  <input
                    className="auth-form__input"
                    type="password"
                    placeholder=" "
                    value={confirmarSenha}
                    onChange={(e) => setConfirmarSenha(e.target.value)}
                    required
                    autoComplete="new-password"
                  />
                  <label className="auth-form__label">{t.forgotPassword.confirmPassword}</label>
                </div>

                <div className="auth-form__actions">
                  <button className="auth-form__btn" type="submit" disabled={carregando}>
                    {carregando ? t.forgotPassword.resetting : t.forgotPassword.resetBtn}
                  </button>
                  <button
                    type="button"
                    className="auth-form__btn-outline"
                    onClick={() => { setPasso(1); setMensagem(""); setErro(false); }}
                  >
                    {t.forgotPassword.resendCode}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
