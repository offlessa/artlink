import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/api";
import { useAuth } from "../context/AuthContext";
import { SendIcon, MessageIcon } from "../components/Icons";
import "../styles/components/Mensagens.scss";

interface Usuario {
  id: number;
  nome: string;
  username: string;
  fotoPerfil?: string;
}

interface Mensagem {
  id: number;
  remetenteId: number;
  destinatarioId: number;
  conteudo: string;
  dataEnvio: string;
  status: "nao_lido" | "lido";
  remetente: Usuario;
  destinatario: Usuario;
}

interface Conversa {
  usuario: Usuario;
  ultimaMensagem: Mensagem;
  naoLidas: number;
}

export default function Mensagens() {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [conversas, setConversas] = useState<Conversa[]>([]);
  const [conversaSelecionada, setConversaSelecionada] = useState<Usuario | null>(null);
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [texto, setTexto] = useState("");
  const [buscaUsuario, setBuscaUsuario] = useState("");
  const [resultadosBusca, setResultadosBusca] = useState<Usuario[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!usuario) { navigate("/login"); return; }
    carregarConversas();
  }, [usuario]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens]);

  useEffect(() => {
    if (!conversaSelecionada || !usuario) return;
    carregarMensagens(conversaSelecionada.id);
    const interval = setInterval(() => carregarMensagens(conversaSelecionada.id), 5000);
    return () => clearInterval(interval);
  }, [conversaSelecionada]);

  async function carregarConversas() {
    if (!usuario) return;
    try {
      const [recebidas, enviadas] = await Promise.all([
        api.get(`/mensagem/destinatario/${usuario.id}`).catch(() => ({ data: { data: [] } })),
        api.get(`/mensagem/remetente/${usuario.id}`).catch(() => ({ data: { data: [] } })),
      ]);

      const todasMensagens: Mensagem[] = [
        ...(recebidas.data?.data ?? recebidas.data ?? []),
        ...(enviadas.data?.data ?? enviadas.data ?? []),
      ];

      const mapa = new Map<number, Conversa>();
      for (const m of todasMensagens) {
        const outroId = m.remetenteId === usuario.id ? m.destinatarioId : m.remetenteId;
        const outro = m.remetenteId === usuario.id ? m.destinatario : m.remetente;
        const existing = mapa.get(outroId);
        const naoLida = m.destinatarioId === usuario.id && m.status === "nao_lido" ? 1 : 0;
        if (!existing || new Date(m.dataEnvio) > new Date(existing.ultimaMensagem.dataEnvio)) {
          mapa.set(outroId, {
            usuario: outro,
            ultimaMensagem: m,
            naoLidas: (existing?.naoLidas ?? 0) + naoLida,
          });
        } else if (naoLida) {
          existing.naoLidas += 1;
        }
      }

      setConversas(Array.from(mapa.values()).sort(
        (a, b) => new Date(b.ultimaMensagem.dataEnvio).getTime() - new Date(a.ultimaMensagem.dataEnvio).getTime()
      ));
    } catch { /* silencioso */ }
  }

  async function carregarMensagens(outroId: number) {
    if (!usuario) return;
    try {
      const [recebidas, enviadas] = await Promise.all([
        api.get(`/mensagem/destinatario/${usuario.id}`).catch(() => ({ data: { data: [] } })),
        api.get(`/mensagem/remetente/${usuario.id}`).catch(() => ({ data: { data: [] } })),
      ]);

      const todas: Mensagem[] = [
        ...(recebidas.data?.data ?? recebidas.data ?? []),
        ...(enviadas.data?.data ?? enviadas.data ?? []),
      ];

      const conversa = todas.filter(m =>
        (m.remetenteId === usuario.id && m.destinatarioId === outroId) ||
        (m.remetenteId === outroId && m.destinatarioId === usuario.id)
      ).sort((a, b) => new Date(a.dataEnvio).getTime() - new Date(b.dataEnvio).getTime());

      setMensagens(conversa);

      // marcar como lidas
      for (const m of conversa) {
        if (m.destinatarioId === usuario.id && m.status === "nao_lido") {
          api.put(`/mensagem/${m.id}`, { status: "lido" }).catch(() => {});
        }
      }
    } catch { /* silencioso */ }
  }

  async function enviarMensagem(e: React.FormEvent) {
    e.preventDefault();
    if (!texto.trim() || !conversaSelecionada || !usuario || enviando) return;
    setEnviando(true);
    try {
      await api.post("/mensagem", {
        remetenteId: usuario.id,
        destinatarioId: conversaSelecionada.id,
        conteudo: texto.trim(),
      });
      setTexto("");
      await carregarMensagens(conversaSelecionada.id);
      carregarConversas();
    } catch { /* silencioso */ } finally {
      setEnviando(false);
    }
  }

  async function buscarUsuarios(q: string) {
    setBuscaUsuario(q);
    if (!q.trim()) { setResultadosBusca([]); return; }
    setBuscando(true);
    try {
      const res = await api.get("/usuario");
      const todos: Usuario[] = res.data?.data ?? res.data ?? [];
      const filtrados = todos.filter(u =>
        u.id !== usuario?.id &&
        (u.nome.toLowerCase().includes(q.toLowerCase()) || u.username.toLowerCase().includes(q.toLowerCase()))
      ).slice(0, 6);
      setResultadosBusca(filtrados);
    } catch {
      setResultadosBusca([]);
    } finally {
      setBuscando(false);
    }
  }

  function iniciarConversa(u: Usuario) {
    setConversaSelecionada(u);
    setBuscaUsuario("");
    setResultadosBusca([]);
  }

  function formatarData(iso: string) {
    const d = new Date(iso);
    const hoje = new Date();
    if (d.toDateString() === hoje.toDateString()) {
      return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    }
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
  }

  const inicial = (nome: string) => nome.charAt(0).toUpperCase();

  return (
    <div className="msgs">
      {/* SIDEBAR */}
      <aside className="msgs__sidebar">
        <div className="msgs__sidebar-header">
          <h2>Mensagens</h2>
        </div>

        <div className="msgs__busca-wrap">
          <input
            type="text"
            placeholder="Buscar pessoa..."
            value={buscaUsuario}
            onChange={e => buscarUsuarios(e.target.value)}
            className="msgs__busca"
          />
          {resultadosBusca.length > 0 && (
            <div className="msgs__busca-resultados">
              {resultadosBusca.map(u => (
                <button key={u.id} className="msgs__busca-item" onClick={() => iniciarConversa(u)}>
                  <div className="msgs__avatar msgs__avatar--sm">
                    {u.fotoPerfil ? <img src={u.fotoPerfil} alt={u.nome} /> : <span>{inicial(u.nome)}</span>}
                  </div>
                  <div>
                    <p className="msgs__nome">{u.nome}</p>
                    <p className="msgs__username">@{u.username}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="msgs__lista">
          {conversas.length === 0 && (
            <div className="msgs__vazio">
              <MessageIcon size={32} />
              <p>Nenhuma conversa ainda</p>
              <span>Busque alguém acima para começar</span>
            </div>
          )}
          {conversas.map(c => (
            <button
              key={c.usuario.id}
              className={`msgs__conversa ${conversaSelecionada?.id === c.usuario.id ? "msgs__conversa--ativa" : ""}`}
              onClick={() => iniciarConversa(c.usuario)}
            >
              <div className="msgs__avatar">
                {c.usuario.fotoPerfil
                  ? <img src={c.usuario.fotoPerfil} alt={c.usuario.nome} />
                  : <span>{inicial(c.usuario.nome)}</span>}
              </div>
              <div className="msgs__conversa-info">
                <div className="msgs__conversa-top">
                  <span className="msgs__nome">{c.usuario.nome}</span>
                  <span className="msgs__data">{formatarData(c.ultimaMensagem.dataEnvio)}</span>
                </div>
                <div className="msgs__conversa-bottom">
                  <span className="msgs__preview">
                    {c.ultimaMensagem.remetenteId === usuario?.id ? "Você: " : ""}
                    {c.ultimaMensagem.conteudo.length > 30
                      ? c.ultimaMensagem.conteudo.slice(0, 30) + "..."
                      : c.ultimaMensagem.conteudo}
                  </span>
                  {c.naoLidas > 0 && <span className="msgs__badge">{c.naoLidas}</span>}
                </div>
              </div>
            </button>
          ))}
        </div>
      </aside>

      {/* CHAT */}
      <main className="msgs__chat">
        {!conversaSelecionada ? (
          <div className="msgs__chat-vazio">
            <MessageIcon size={48} />
            <p>Selecione uma conversa ou busque alguém para começar</p>
          </div>
        ) : (
          <>
            <div className="msgs__chat-header">
              <div className="msgs__avatar msgs__avatar--sm">
                {conversaSelecionada.fotoPerfil
                  ? <img src={conversaSelecionada.fotoPerfil} alt={conversaSelecionada.nome} />
                  : <span>{inicial(conversaSelecionada.nome)}</span>}
              </div>
              <div>
                <p className="msgs__nome">{conversaSelecionada.nome}</p>
                <p className="msgs__username">@{conversaSelecionada.username}</p>
              </div>
            </div>

            <div className="msgs__mensagens">
              {mensagens.length === 0 && (
                <div className="msgs__chat-vazio msgs__chat-vazio--inline">
                  <p>Comece a conversa!</p>
                </div>
              )}
              {mensagens.map(m => (
                <div
                  key={m.id}
                  className={`msgs__balao ${m.remetenteId === usuario?.id ? "msgs__balao--eu" : "msgs__balao--outro"}`}
                >
                  <p>{m.conteudo}</p>
                  <span className="msgs__balao-data">{formatarData(m.dataEnvio)}</span>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <form className="msgs__form" onSubmit={enviarMensagem}>
              <input
                type="text"
                placeholder="Digite uma mensagem..."
                value={texto}
                onChange={e => setTexto(e.target.value)}
                className="msgs__input"
                disabled={enviando}
              />
              <button type="submit" className="msgs__enviar" disabled={!texto.trim() || enviando}>
                <SendIcon size={18} />
              </button>
            </form>
          </>
        )}
      </main>
    </div>
  );
}
