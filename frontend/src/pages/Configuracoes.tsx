import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/api";
import { useAuth } from "../context/AuthContext";
import { parseConfiguracoes, DEFAULT_CONFIG, type Configuracoes } from "../hooks/useConfiguracoes";
import Footer from "../components/Footer";
import { SettingsIcon, BellIcon, LockIcon, PaletteIcon, UsersIcon, MessageIcon, TrashIcon } from "../components/Icons";
import "../styles/components/Configuracoes.scss";

// ── Toggle ───────────────────────────────────────────────────────────────────
function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button role="switch" aria-checked={checked} type="button"
      className={`cfg-toggle ${checked ? "cfg-toggle--on" : ""} ${disabled ? "cfg-toggle--disabled" : ""}`}
      onClick={() => !disabled && onChange(!checked)}
    ><span className="cfg-toggle__thumb" /></button>
  );
}

// ── Select ───────────────────────────────────────────────────────────────────
function Select<T extends string>({ value, options, onChange, disabled }: {
  value: T; options: { value: T; label: string }[]; onChange: (v: T) => void; disabled?: boolean;
}) {
  return (
    <select
      className="cfg-select"
      value={value}
      onChange={e => onChange(e.target.value as T)}
      disabled={disabled}
    >
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

export default function Configuracoes() {
  const { usuario, updateUsuario, logout } = useAuth();
  const navigate = useNavigate();

  const [config, setConfig] = useState<Configuracoes>(DEFAULT_CONFIG);
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);

  // Alterar username
  const [novoUsername, setNovoUsername] = useState("");
  const [erroUsername, setErroUsername] = useState("");
  const [salvandoUsername, setSalvandoUsername] = useState(false);
  const [usernameSalvo, setUsernameSalvo] = useState(false);

  // Segurança — alterar senha
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [erroSenha, setErroSenha] = useState("");
  const [salvandoSenha, setSalvandoSenha] = useState(false);
  const [senhaSalva, setSenhaSalva] = useState(false);

  const excluirRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!usuario) { navigate("/login"); return; }
    setConfig(parseConfiguracoes(usuario.configuracoes));
  }, [usuario?.id]);

  // Helpers para atualizar seções
  function setN<K extends keyof Configuracoes["notificacoes"]>(k: K, v: Configuracoes["notificacoes"][K]) {
    setConfig(p => ({ ...p, notificacoes: { ...p.notificacoes, [k]: v } }));
    setSalvo(false);
  }
  function setP<K extends keyof Configuracoes["privacidade"]>(k: K, v: Configuracoes["privacidade"][K]) {
    setConfig(p => ({ ...p, privacidade: { ...p.privacidade, [k]: v } }));
    setSalvo(false);
  }
  function setA<K extends keyof Configuracoes["aparencia"]>(k: K, v: Configuracoes["aparencia"][K]) {
    setConfig(p => ({ ...p, aparencia: { ...p.aparencia, [k]: v } }));
    setSalvo(false);
  }
  function setF<K extends keyof Configuracoes["feed"]>(k: K, v: Configuracoes["feed"][K]) {
    setConfig(p => ({ ...p, feed: { ...p.feed, [k]: v } }));
    setSalvo(false);
  }
  function setM<K extends keyof Configuracoes["mensagens"]>(k: K, v: Configuracoes["mensagens"][K]) {
    setConfig(p => ({ ...p, mensagens: { ...p.mensagens, [k]: v } }));
    setSalvo(false);
  }
  function setR<K extends keyof Configuracoes["regiao"]>(k: K, v: Configuracoes["regiao"][K]) {
    setConfig(p => ({ ...p, regiao: { ...p.regiao, [k]: v } }));
    setSalvo(false);
  }

  async function salvar() {
    if (!usuario) return;
    setSalvando(true);
    try {
      const json = JSON.stringify(config);
      await api.put(`/usuario/${usuario.id}`, { configuracoes: json });
      updateUsuario({ configuracoes: json });
      setSalvo(true);
      setTimeout(() => setSalvo(false), 2500);
    } catch { /* silencioso */ } finally { setSalvando(false); }
  }

  async function alterarSenha(e: React.FormEvent) {
    e.preventDefault();
    setErroSenha("");
    if (novaSenha !== confirmarSenha) { setErroSenha("As senhas não coincidem."); return; }
    if (novaSenha.length < 6) { setErroSenha("A nova senha deve ter pelo menos 6 caracteres."); return; }
    setSalvandoSenha(true);
    try {
      await api.put(`/usuario/${usuario!.id}/senha`, { senhaAtual, novaSenha });
      setSenhaAtual(""); setNovaSenha(""); setConfirmarSenha("");
      setSenhaSalva(true);
      setTimeout(() => setSenhaSalva(false), 3000);
    } catch (err: any) {
      setErroSenha(err.response?.data?.message ?? "Erro ao alterar senha.");
    } finally { setSalvandoSenha(false); }
  }

  async function alterarUsername(e: React.FormEvent) {
    e.preventDefault();
    setErroUsername("");
    const u = novoUsername.trim().toLowerCase();
    if (!u) { setErroUsername("Digite um username."); return; }
    if (u === usuario?.username) { setErroUsername("É o mesmo username atual."); return; }
    if (!/^[a-z0-9_]{3,30}$/.test(u)) { setErroUsername("Só letras minúsculas, números e _ (3–30 caracteres)."); return; }
    setSalvandoUsername(true);
    try {
      await api.put(`/usuario/${usuario!.id}`, { username: u });
      updateUsuario({ username: u });
      setNovoUsername("");
      setUsernameSalvo(true);
      setTimeout(() => setUsernameSalvo(false), 3000);
    } catch (err: any) {
      setErroUsername(err.response?.data?.message ?? "Esse username já está em uso.");
    } finally { setSalvandoUsername(false); }
  }

  async function exportarDados() {
    try {
      const res = await api.get(`/usuario/${usuario!.id}/exportar`, { responseType: "blob" });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = `artlink-dados.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch { alert("Erro ao exportar dados."); }
  }

  async function excluirConta() {
    const confirmado = excluirRef.current?.value === `@${usuario?.username}`;
    if (!confirmado) { alert(`Digite @${usuario?.username} para confirmar.`); return; }
    if (!confirm("Tem certeza? Esta ação é irreversível.")) return;
    try {
      await api.delete(`/usuario/${usuario!.id}`);
      logout();
      navigate("/");
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? "Erro ao excluir conta.";
      alert(msg);
    }
  }

  const n = config.notificacoes;
  const p = config.privacidade;
  const a = config.aparencia;
  const f = config.feed;
  const m = config.mensagens;
  const r = config.regiao;

  const tiposNotif: { key: keyof Configuracoes["notificacoes"]; label: string; desc: string }[] = [
    { key: "curtida",              label: "Curtidas",                          desc: "Quando alguém curte seu post" },
    { key: "comentario",           label: "Comentários",                       desc: "Quando alguém comenta no seu post" },
    { key: "seguindo",             label: "Novos seguidores",                  desc: "Quando alguém começa a te seguir" },
    { key: "colaboracao",          label: "Convite de colaboração (post)",      desc: "Quando te convidam para colaborar em um post" },
    { key: "colaboracao_catalogo", label: "Convite de colaboração (catálogo)",  desc: "Quando te convidam para colaborar em um catálogo" },
    { key: "mensagem",             label: "Mensagens",                         desc: "Quando alguém te envia uma mensagem" },
  ];

  return (
    <div className="cfg">
      <div className="cfg__container">
        <div className="cfg__header">
          <SettingsIcon size={22} />
          <h1>Configurações</h1>
        </div>

        {/* ── 1. NOTIFICAÇÕES ──────────────────────────────────── */}
        <section className="cfg__secao">
          <div className="cfg__secao-titulo"><BellIcon size={16} /><span>Notificações</span></div>

          <div className="cfg__item cfg__item--master">
            <div className="cfg__item-info">
              <span className="cfg__item-label">Ativar notificações</span>
              <span className="cfg__item-desc">Liga ou desliga todas as notificações</span>
            </div>
            <Toggle checked={n.ativas} onChange={v => setN("ativas", v)} />
          </div>

          <div className={`cfg__lista ${!n.ativas ? "cfg__lista--bloqueada" : ""}`}>
            {tiposNotif.map(t => (
              <div key={t.key} className="cfg__item">
                <div className="cfg__item-info">
                  <span className="cfg__item-label">{t.label}</span>
                  <span className="cfg__item-desc">{t.desc}</span>
                </div>
                <Toggle checked={n[t.key] as boolean} onChange={v => setN(t.key, v)} disabled={!n.ativas} />
              </div>
            ))}
            <div className="cfg__item cfg__item--som">
              <div className="cfg__item-info">
                <span className="cfg__item-label">Som de notificação</span>
                <span className="cfg__item-desc">Toca um tom suave ao receber notificações</span>
              </div>
              <Toggle checked={n.som} onChange={v => setN("som", v)} disabled={!n.ativas} />
            </div>
          </div>
        </section>

        {/* ── 2. PRIVACIDADE ───────────────────────────────────── */}
        <section className="cfg__secao">
          <div className="cfg__secao-titulo"><LockIcon size={16} /><span>Privacidade</span></div>

          <div className="cfg__item">
            <div className="cfg__item-info">
              <span className="cfg__item-label">Conta privada</span>
              <span className="cfg__item-desc">Somente seguidores veem seus posts e catálogos</span>
            </div>
            <Toggle checked={p.contaPrivada} onChange={v => setP("contaPrivada", v)} />
          </div>

          <div className="cfg__item">
            <div className="cfg__item-info">
              <span className="cfg__item-label">Quem pode te enviar mensagens</span>
              <span className="cfg__item-desc">Controla quem tem permissão para iniciar uma conversa</span>
            </div>
            <Select<"todos" | "seguidos" | "ninguem">
              value={p.quemPodeMensagem}
              onChange={v => setP("quemPodeMensagem", v)}
              options={[
                { value: "todos", label: "Todos" },
                { value: "seguidos", label: "Apenas quem você segue" },
                { value: "ninguem", label: "Ninguém" },
              ]}
            />
          </div>

          <div className="cfg__item">
            <div className="cfg__item-info">
              <span className="cfg__item-label">Quem pode te convidar para colaborar</span>
              <span className="cfg__item-desc">Controla quem pode enviar convites de colaboração</span>
            </div>
            <Select<"todos" | "seguidos">
              value={p.quemPodeConvidar}
              onChange={v => setP("quemPodeConvidar", v)}
              options={[
                { value: "todos", label: "Todos" },
                { value: "seguidos", label: "Apenas quem você segue" },
              ]}
            />
          </div>
        </section>

        {/* ── 3. APARÊNCIA ─────────────────────────────────────── */}
        <section className="cfg__secao">
          <div className="cfg__secao-titulo"><PaletteIcon size={16} /><span>Aparência</span></div>

          <div className="cfg__item">
            <div className="cfg__item-info">
              <span className="cfg__item-label">Tema</span>
              <span className="cfg__item-desc">Alterna entre modo claro, escuro ou segue o sistema</span>
            </div>
            <Select<"claro" | "escuro" | "sistema">
              value={a.tema}
              onChange={v => setA("tema", v)}
              options={[
                { value: "claro", label: "Claro" },
                { value: "escuro", label: "Escuro" },
                { value: "sistema", label: "Seguir sistema" },
              ]}
            />
          </div>

          <div className="cfg__item">
            <div className="cfg__item-info">
              <span className="cfg__item-label">Tamanho de fonte</span>
              <span className="cfg__item-desc">Ajusta o tamanho do texto em toda a interface</span>
            </div>
            <Select<"pequeno" | "medio" | "grande">
              value={a.tamanhoFonte}
              onChange={v => setA("tamanhoFonte", v)}
              options={[
                { value: "pequeno", label: "Pequeno (88%)" },
                { value: "medio", label: "Médio (padrão)" },
                { value: "grande", label: "Grande (113%)" },
              ]}
            />
          </div>

          <div className="cfg__item">
            <div className="cfg__item-info">
              <span className="cfg__item-label">Densidade do feed</span>
              <span className="cfg__item-desc">Quanto espaço cada publicação ocupa no feed</span>
            </div>
            <Select<"confortavel" | "normal" | "compacto">
              value={a.densidadeFeed}
              onChange={v => setA("densidadeFeed", v)}
              options={[
                { value: "confortavel", label: "Confortável" },
                { value: "normal", label: "Normal" },
                { value: "compacto", label: "Compacto" },
              ]}
            />
          </div>
        </section>

        {/* ── 4. FEED ──────────────────────────────────────────── */}
        <section className="cfg__secao">
          <div className="cfg__secao-titulo"><UsersIcon size={16} /><span>Feed</span></div>

          <div className="cfg__item">
            <div className="cfg__item-info">
              <span className="cfg__item-label">Mostrar publicações de todos (Descoberta)</span>
              <span className="cfg__item-desc">Exibe posts de pessoas que você não segue na aba Explorar</span>
            </div>
            <Toggle checked={f.mostrarDescoberta} onChange={v => setF("mostrarDescoberta", v)} />
          </div>

          <div className="cfg__item">
            <div className="cfg__item-info">
              <span className="cfg__item-label">Ordem do feed</span>
              <span className="cfg__item-desc">Como as publicações são ordenadas</span>
            </div>
            <Select<"recente" | "engajamento">
              value={f.ordem}
              onChange={v => setF("ordem", v)}
              options={[
                { value: "recente", label: "Mais recentes primeiro" },
                { value: "engajamento", label: "Mais curtidos primeiro" },
              ]}
            />
          </div>
        </section>

        {/* ── 5. MENSAGENS ─────────────────────────────────────── */}
        <section className="cfg__secao">
          <div className="cfg__secao-titulo"><MessageIcon size={16} /><span>Mensagens</span></div>

          <div className="cfg__item">
            <div className="cfg__item-info">
              <span className="cfg__item-label">Confirmação de leitura</span>
              <span className="cfg__item-desc">Permite que outras pessoas vejam quando você leu a mensagem</span>
            </div>
            <Toggle checked={m.confirmarLeitura} onChange={v => setM("confirmarLeitura", v)} />
          </div>

          <div className="cfg__item">
            <div className="cfg__item-info">
              <span className="cfg__item-label">Prazo para apagar para todos</span>
              <span className="cfg__item-desc">Máximo de minutos após o envio para usar "Apagar para todos"</span>
            </div>
            <div className="cfg__range-wrap">
              <input
                type="range"
                min={1}
                max={60}
                step={1}
                value={m.limitePararaTodos}
                onChange={e => setM("limitePararaTodos", Number(e.target.value))}
                className="cfg-range"
              />
              <span className="cfg__range-val">{m.limitePararaTodos} min</span>
            </div>
          </div>
        </section>

        {/* ── 6. IDIOMA & REGIÃO ───────────────────────────────── */}
        <section className="cfg__secao">
          <div className="cfg__secao-titulo">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>
            <span>Idioma & Região</span>
          </div>

          <div className="cfg__item">
            <div className="cfg__item-info">
              <span className="cfg__item-label">Idioma da interface</span>
              <span className="cfg__item-desc">Idioma exibido em botões e mensagens do sistema</span>
            </div>
            <Select<"pt-BR" | "en-US">
              value={r.idioma}
              onChange={v => setR("idioma", v)}
              options={[
                { value: "pt-BR", label: "Português (Brasil)" },
                { value: "en-US", label: "English (US)" },
              ]}
            />
          </div>

          <div className="cfg__item">
            <div className="cfg__item-info">
              <span className="cfg__item-label">Formato de data</span>
              <span className="cfg__item-desc">Como as datas são exibidas em todo o app</span>
            </div>
            <Select<"DD/MM/YYYY" | "MM/DD/YYYY" | "YYYY-MM-DD">
              value={r.formatoData}
              onChange={v => setR("formatoData", v)}
              options={[
                { value: "DD/MM/YYYY", label: "DD/MM/AAAA (Brasil)" },
                { value: "MM/DD/YYYY", label: "MM/DD/YYYY (EUA)" },
                { value: "YYYY-MM-DD", label: "AAAA-MM-DD (ISO)" },
              ]}
            />
          </div>
        </section>

        {/* ── 7. CONTA & SEGURANÇA ─────────────────────────────── */}
        <section className="cfg__secao">
          <div className="cfg__secao-titulo">
            <LockIcon size={16} /><span>Conta & Segurança</span>
          </div>

          {/* Alterar username */}
          <div className="cfg__subbloco">
            <p className="cfg__sublabel">Alterar @username</p>
            <p className="cfg__item-desc" style={{ marginBottom: 8 }}>Atual: <strong>@{usuario?.username}</strong></p>
            <form className="cfg__senha-form" onSubmit={alterarUsername}>
              <input
                type="text"
                placeholder="Novo username (ex: meu_nome)"
                value={novoUsername}
                onChange={e => setNovoUsername(e.target.value)}
                className="cfg__input"
                autoComplete="off"
              />
              {erroUsername && <p className="cfg__erro">{erroUsername}</p>}
              {usernameSalvo && <p className="cfg__sucesso">✓ Username alterado com sucesso!</p>}
              <button type="submit" className="cfg__btn-sec" disabled={salvandoUsername}>
                {salvandoUsername ? "Salvando..." : "Alterar username"}
              </button>
            </form>
          </div>

          {/* Alterar senha */}
          <div className="cfg__subbloco">
            <p className="cfg__sublabel">Alterar senha</p>
            <form className="cfg__senha-form" onSubmit={alterarSenha}>
              <input
                type="password"
                placeholder="Senha atual"
                value={senhaAtual}
                onChange={e => setSenhaAtual(e.target.value)}
                className="cfg__input"
                autoComplete="current-password"
              />
              <input
                type="password"
                placeholder="Nova senha (mín. 6 caracteres)"
                value={novaSenha}
                onChange={e => setNovaSenha(e.target.value)}
                className="cfg__input"
                autoComplete="new-password"
              />
              <input
                type="password"
                placeholder="Confirmar nova senha"
                value={confirmarSenha}
                onChange={e => setConfirmarSenha(e.target.value)}
                className="cfg__input"
                autoComplete="new-password"
              />
              {erroSenha && <p className="cfg__erro">{erroSenha}</p>}
              {senhaSalva && <p className="cfg__sucesso">✓ Senha alterada com sucesso!</p>}
              <button type="submit" className="cfg__btn-sec" disabled={salvandoSenha}>
                {salvandoSenha ? "Salvando..." : "Alterar senha"}
              </button>
            </form>
          </div>

          {/* Sair de todos os dispositivos */}
          <div className="cfg__item">
            <div className="cfg__item-info">
              <span className="cfg__item-label">Sair de todos os dispositivos</span>
              <span className="cfg__item-desc">Encerra todas as sessões ativas (exceto a atual)</span>
            </div>
            <button className="cfg__btn-sec" onClick={() => { logout(); navigate("/login"); }}>
              Sair agora
            </button>
          </div>

          {/* Exportar dados */}
          <div className="cfg__item">
            <div className="cfg__item-info">
              <span className="cfg__item-label">Exportar meus dados</span>
              <span className="cfg__item-desc">Baixa um arquivo JSON com seus posts, catálogos e mensagens</span>
            </div>
            <button className="cfg__btn-sec" onClick={exportarDados}>
              Exportar
            </button>
          </div>

          {/* Excluir conta */}
          <div className="cfg__subbloco cfg__subbloco--perigo">
            <p className="cfg__sublabel cfg__sublabel--perigo">Excluir conta</p>
            <p className="cfg__item-desc" style={{ marginBottom: 10 }}>
              Todos os seus posts, catálogos e mensagens serão permanentemente removidos. Essa ação não pode ser desfeita.
            </p>
            <input
              ref={excluirRef}
              type="text"
              placeholder={`Digite @${usuario?.username} para confirmar`}
              className="cfg__input cfg__input--perigo"
            />
            <button className="cfg__btn-perigo" onClick={excluirConta}>
              <TrashIcon size={14} /> Excluir minha conta
            </button>
          </div>
        </section>

        {/* Botão salvar global */}
        <div className="cfg__rodape">
          <button className="cfg__salvar" onClick={salvar} disabled={salvando}>
            {salvando ? "Salvando..." : salvo ? "✓ Salvo!" : "Salvar configurações"}
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
}
