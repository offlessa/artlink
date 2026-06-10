import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/api";
import { XIcon, WhatsAppIcon, LinkIcon } from "./Icons";
import Toast from "./Toast";
import { urlPublica, copiarLink } from "../utils/compartilhar";
import "../styles/components/ShareModal.scss";

interface Usuario { id: number; nome: string; username: string; fotoPerfil?: string }

interface Props {
  tipo: "post" | "catalogo" | "perfil";
  id: number | string;
  titulo?: string;
  subtitulo?: string;
  onClose: () => void;
}

export default function ShareModal({ tipo, id, titulo, subtitulo, onClose }: Props) {
  const { usuario } = useAuth();
  const [busca, setBusca] = useState("");
  const [sugestoes, setSugestoes] = useState<Usuario[]>([]);
  const [resultados, setResultados] = useState<Usuario[]>([]);
  const [enviados, setEnviados] = useState<Set<number>>(new Set());
  const [toast, setToast] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const allUsersRef = useRef<Usuario[]>([]);

  const path = tipo === "perfil" ? `/u/${id}` : `/${tipo}/${id}`;
  const url = urlPublica(path);

  useEffect(() => {
    inputRef.current?.focus();
    if (usuario) {
      carregarSugestoes();
      carregarTodosUsuarios();
    }
  }, []);

  async function carregarSugestoes() {
    if (!usuario) return;
    try {
      const res = await api.get(`/seguidor/seguindo/${usuario.id}`);
      const lista: Usuario[] = res.data?.data ?? res.data ?? [];
      setSugestoes(lista.slice(0, 5));
    } catch { setSugestoes([]); }
  }

  async function carregarTodosUsuarios() {
    try {
      const res = await api.get("/usuario");
      allUsersRef.current = (res.data?.data ?? res.data ?? []).filter(
        (u: Usuario) => u.id !== usuario?.id
      );
    } catch { allUsersRef.current = []; }
  }

  useEffect(() => {
    if (!busca.trim()) { setResultados([]); return; }
    const q = busca.toLowerCase();
    setResultados(
      allUsersRef.current
        .filter(u => u.nome.toLowerCase().includes(q) || u.username.toLowerCase().includes(q))
        .slice(0, 6)
    );
  }, [busca]);

  async function enviarPara(dest: Usuario) {
    if (!usuario || enviados.has(dest.id)) return;
    const textoTipo = tipo === "post" ? "post" : tipo === "catalogo" ? "catálogo" : "perfil";
    const conteudo = titulo
      ? `Olha esse ${textoTipo} no Artlink: "${titulo}" — ${url}`
      : `Olha esse ${textoTipo} no Artlink: ${url}`;
    try {
      await api.post("/mensagem", { remetenteId: usuario.id, destinatarioId: dest.id, conteudo });
      setEnviados(prev => new Set(prev).add(dest.id));
      mostrarToast(`Enviado para @${dest.username}!`);
    } catch { mostrarToast("Erro ao enviar."); }
  }

  function abrirWhatsApp() {
    const emoji = tipo === "post" ? "🎨" : tipo === "catalogo" ? "🗂️" : "👤";
    const desc = subtitulo ?? (tipo === "post" ? "Publicação no Artlink" : tipo === "catalogo" ? "Catálogo no Artlink" : "Artista no Artlink");
    const msg = [
      `${emoji} *${titulo ?? "Artlink"}*`,
      `_${desc}_`,
      "",
      `👉 ${url}`,
    ].join("\n");
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  }

  function handleCopiarLink() {
    copiarLink(path, mostrarToast, "Link copiado!");
  }

  function mostrarToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  }

  const listaMostrada = busca.trim() ? resultados : sugestoes;
  const semResultados = busca.trim() && resultados.length === 0;

  return (
    <>
      <div className="share-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
        <div className="share-modal">
          <div className="share-modal__header">
            <span>Compartilhar</span>
            <button className="share-modal__close" onClick={onClose}><XIcon size={18} /></button>
          </div>

          {usuario && (
            <>
              <div className="share-modal__search-wrap">
                <input
                  ref={inputRef}
                  className="share-modal__search"
                  type="text"
                  placeholder="Buscar pessoa..."
                  value={busca}
                  onChange={e => setBusca(e.target.value)}
                />
              </div>

              <div className="share-modal__users">
                {!busca.trim() && sugestoes.length > 0 && (
                  <p className="share-modal__section-label">Sugestões</p>
                )}
                {semResultados ? (
                  <p className="share-modal__hint">Nenhum usuário encontrado.</p>
                ) : listaMostrada.map(u => (
                  <div key={u.id} className="share-modal__user">
                    <div className="share-modal__avatar">
                      {u.fotoPerfil
                        ? <img src={u.fotoPerfil} alt={u.nome} />
                        : <span>{u.nome.charAt(0).toUpperCase()}</span>}
                    </div>
                    <div className="share-modal__user-info">
                      <span className="share-modal__user-nome">{u.nome}</span>
                      <span className="share-modal__user-username">@{u.username}</span>
                    </div>
                    <button
                      className={`share-modal__send-btn ${enviados.has(u.id) ? "share-modal__send-btn--sent" : ""}`}
                      onClick={() => enviarPara(u)}
                      disabled={enviados.has(u.id)}
                    >
                      {enviados.has(u.id) ? "Enviado ✓" : "Enviar"}
                    </button>
                  </div>
                ))}
              </div>

              <div className="share-modal__divider" />
            </>
          )}

          <div className="share-modal__options">
            <button className="share-modal__opt share-modal__opt--whatsapp" onClick={abrirWhatsApp}>
              <WhatsAppIcon size={24} />
              <span>WhatsApp</span>
            </button>
            <button className="share-modal__opt" onClick={handleCopiarLink}>
              <LinkIcon size={22} />
              <span>Copiar link</span>
            </button>
          </div>
        </div>
      </div>
      {toast && <Toast mensagem={toast} visivel={!!toast} onFadeOut={() => setToast("")} />}
    </>
  );
}
