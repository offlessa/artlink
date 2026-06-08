import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { api } from "../api/api";
import { useI18n } from "../hooks/useI18n";
import "../styles/components/Login.scss";
import "../styles/components/VerificarEmail.scss";

export default function VerificarEmail() {
  const [params] = useSearchParams();
  const t = useI18n();
  const [estado, setEstado] = useState<"verificando" | "sucesso" | "erro">("verificando");

  useEffect(() => {
    const token = params.get("token");
    if (!token) { setEstado("erro"); return; }

    api.post("/auth/verificar-email", { token })
      .then(() => {
        setEstado("sucesso");
        setTimeout(() => { window.location.href = "/login"; }, 3000);
      })
      .catch(() => setEstado("erro"));
  }, []);

  return (
    <div className="auth-page auth-page--center">
      <div className="verif">
        <span className="verif__icon">
          {estado === "verificando" && "⏳"}
          {estado === "sucesso" && "✅"}
          {estado === "erro" && "❌"}
        </span>
        <h1 className="verif__titulo">
          {estado === "verificando" && t.verifyEmail.verifying}
          {estado === "sucesso" && t.verifyEmail.success}
          {estado === "erro" && t.verifyEmail.error}
        </h1>
        <p className="verif__hint">
          {estado === "sucesso" && t.verifyEmail.successHint}
          {estado === "erro" && t.verifyEmail.errorHint}
        </p>
        {estado === "erro" && (
          <Link to="/login" className="auth-form__btn" style={{ textDecoration: "none", display: "inline-block" }}>
            {t.verifyEmail.backToLogin}
          </Link>
        )}
      </div>
    </div>
  );
}
