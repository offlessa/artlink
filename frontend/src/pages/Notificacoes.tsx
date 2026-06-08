import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/api";
import { useAuth } from "../context/AuthContext";
import { useI18n } from "../hooks/useI18n";
import { BellIcon } from "../components/Icons";
import Footer from "../components/Footer";
import "../styles/components/Notificacoes.scss";

type TipoNotif = "curtida" | "comentario" | "seguindo" | "colaboracao" | "colaboracao_catalogo" | "mensagem";

interface Notificacao {
  id: number;
  tipo: TipoNotif;
  lida: boolean;
  data: string;
  postId?: number;
  catalogoId?: number;
  remetente: { id: number; nome: string; username: string; fotoPerfil?: string };
  post?: { id: number; titulo: string };
  catalogo?: { id: number; nome: string };
}

function formatarData(iso: string) {
  const d = new Date(iso);
  const agora = new Date();
  const diff = Math.floor((agora.getTime() - d.getTime()) / 1000);
  if (diff < 60)    return "agora mesmo";
  if (diff < 3600)  return `há ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `há ${Math.floor(diff / 3600)}h`;
  if (diff < 604800)return `há ${Math.floor(diff / 86400)}d`;
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

const TIPO_LABEL: Record<TipoNotif, string> = {
  curtida:              "Curtida",
  comentario:           "Comentário",
  seguindo:             "Seguidor",
  colaboracao:          "Colaboração",
  colaboracao_catalogo: "Colaboração",
  mensagem:             "Mensagem",
};

const TIPO_COR: Record<TipoNotif, string> = {
  curtida:              "#e05a5a",
  comentario:           "#5a8ae0",
  seguindo:             "#5ab85a",
  colaboracao:          "#d4a017",
  colaboracao_catalogo: "#d4a017",
  mensagem:             "#7e57c2",
};

export default function Notificacoes() {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const t = useI18n();
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [respondendo, setRespondendo] = useState<number | null>(null);

  useEffect(() => {
    if (!usuario) { navigate("/login"); return; }
    carregar();
  }, [usuario?.id]);

  async function carregar() {
    if (!usuario) return;
    setCarregando(true);
    try {
      const res = await api.get(`/notificacao/${usuario.id}`);
      const dados = res.data?.data ?? res.data ?? [];
      setNotificacoes(Array.isArray(dados) ? dados : []);
      // Marca todas como lidas ao abrir a página
      if (dados.some((n: Notificacao) => !n.lida)) {
        api.put(`/notificacao/marcar-lidas/${usuario.id}`).catch(() => {});
        setNotificacoes(prev => prev.map(n => ({ ...n, lida: true })));
      }
    } catch {
      setNotificacoes([]);
    } finally {
      setCarregando(false);
    }
  }

  async function responderColaboracao(n: Notificacao, aceitar: boolean) {
    setRespondendo(n.id);
    try {
      const acao = aceitar ? "aceitar" : "recusar";
      if (n.tipo === "colaboracao_catalogo" && n.catalogoId) {
        await api.patch(`/catalogo/colaboracao/${n.catalogoId}/${acao}`);
      } else if (n.post) {
        await api.patch(`/post/colaboracao/${n.post.id}/${acao}`);
      }
      await carregar();
    } catch { /* silencioso */ }
    finally { setRespondendo(null); }
  }

  function textoNotificacao(n: Notificacao) {
    const v = t.notifications.notifVerbs;
    switch (n.tipo) {
      case "curtida":              return <>{v.curtida} <strong>"{n.post?.titulo ?? ""}"</strong></>;
      case "comentario":           return <>{v.comentario} <strong>"{n.post?.titulo ?? ""}"</strong></>;
      case "seguindo":             return <>{v.seguindo}</>;
      case "colaboracao":          return <>{v.colaboracao} <strong>"{n.post?.titulo ?? ""}"</strong></>;
      case "colaboracao_catalogo": return <>{v.colaboracao_catalogo} <strong>"{n.catalogo?.nome ?? ""}"</strong></>;
      case "mensagem":             return <>{v.mensagem}</>;
    }
  }

  function aoClicar(n: Notificacao) {
    if (n.tipo === "colaboracao" || n.tipo === "colaboracao_catalogo") return;
    if (n.tipo === "mensagem")             { navigate("/mensagens"); return; }
    if (n.tipo === "seguindo")             { navigate(`/u/${n.remetente.username}`); return; }
    if (n.post)                            { navigate(`/post/${n.post.id}`); return; }
  }

  const ehColaboracao = (tipo: TipoNotif) =>
    tipo === "colaboracao" || tipo === "colaboracao_catalogo";

  const naoLidas = notificacoes.filter(n => !n.lida).length;

  return (
    <div className="notif-page">
      <div className="notif-page__container">

        {/* Cabeçalho */}
        <div className="notif-page__header">
          <div className="notif-page__header-left">
            <BellIcon size={22} />
            <h1>{t.notifications.title}</h1>
          </div>
          {naoLidas > 0 && (
            <span className="notif-page__badge-total">{t.notifications.newBadge(naoLidas)}</span>
          )}
        </div>

        {/* Conteúdo */}
        {carregando ? (
          <div className="notif-page__lista">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="notif-page__skeleton" />
            ))}
          </div>
        ) : notificacoes.length === 0 ? (
          <div className="notif-page__vazio">
            <BellIcon size={48} />
            <p>{t.notifications.empty}</p>
            <span>{t.notifications.emptyHint}</span>
          </div>
        ) : (
          <div className="notif-page__lista">
            {notificacoes.map(n => (
              <div
                key={n.id}
                className={`notif-page__item ${!n.lida ? "notif-page__item--nova" : ""} ${ehColaboracao(n.tipo) ? "notif-page__item--colab" : ""}`}
                onClick={() => aoClicar(n)}
                style={{ cursor: ehColaboracao(n.tipo) ? "default" : "pointer" }}
              >
                {/* Indicador de tipo */}
                <span
                  className="notif-page__tipo-dot"
                  style={{ background: TIPO_COR[n.tipo] }}
                  title={TIPO_LABEL[n.tipo]}
                />

                {/* Avatar */}
                <div className="notif-page__avatar">
                  {n.remetente.fotoPerfil
                    ? <img src={n.remetente.fotoPerfil} alt={n.remetente.nome} />
                    : <span>{n.remetente.nome.charAt(0).toUpperCase()}</span>}
                </div>

                {/* Texto */}
                <div className="notif-page__texto">
                  <p>
                    <strong
                      className="notif-page__remetente"
                      onClick={e => { e.stopPropagation(); navigate(`/u/${n.remetente.username}`); }}
                    >
                      {n.remetente.nome}
                    </strong>
                    {" "}{textoNotificacao(n)}
                  </p>
                  <span className="notif-page__data">{formatarData(n.data)}</span>

                  {/* Botões aceitar/recusar para colaboração */}
                  {ehColaboracao(n.tipo) && (
                    <div className="notif-page__acoes">
                      <button
                        className="notif-page__aceitar"
                        disabled={respondendo === n.id}
                        onClick={e => { e.stopPropagation(); responderColaboracao(n, true); }}
                      >
                        {respondendo === n.id ? "..." : t.notifications.accept}
                      </button>
                      <button
                        className="notif-page__recusar"
                        disabled={respondendo === n.id}
                        onClick={e => { e.stopPropagation(); responderColaboracao(n, false); }}
                      >
                        {t.notifications.reject}
                      </button>
                    </div>
                  )}
                </div>

                {/* Badge nova */}
                {!n.lida && <span className="notif-page__nova-dot" />}
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
