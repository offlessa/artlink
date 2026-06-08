import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/api";
import { useAuth } from "../context/AuthContext";
import { parseConfiguracoes, DEFAULT_CONFIG, type Configuracoes } from "../hooks/useConfiguracoes";
import { useI18n } from "../hooks/useI18n";
import Footer from "../components/Footer";
import { SettingsIcon, BellIcon, PaletteIcon, UsersIcon, TrashIcon } from "../components/Icons";
import "../styles/components/Configuracoes.scss";

function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button role="switch" aria-checked={checked} type="button"
      className={`cfg-toggle ${checked ? "cfg-toggle--on" : ""} ${disabled ? "cfg-toggle--disabled" : ""}`}
      onClick={() => !disabled && onChange(!checked)}
    ><span className="cfg-toggle__thumb" /></button>
  );
}

function Select<T extends string>({ value, options, onChange, disabled }: {
  value: T; options: { value: T; label: string }[]; onChange: (v: T) => void; disabled?: boolean;
}) {
  return (
    <select className="cfg-select" value={value} onChange={e => onChange(e.target.value as T)} disabled={disabled}>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

export default function Configuracoes() {
  const { usuario, updateUsuario, logout } = useAuth();
  const navigate = useNavigate();
  const t = useI18n();
  const tc = t.config;

  const [config, setConfig] = useState<Configuracoes>(DEFAULT_CONFIG);
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);

  const [novoUsername, setNovoUsername] = useState("");
  const [erroUsername, setErroUsername] = useState("");
  const [salvandoUsername, setSalvandoUsername] = useState(false);
  const [usernameSalvo, setUsernameSalvo] = useState(false);

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

  function setN<K extends keyof Configuracoes["notificacoes"]>(k: K, v: Configuracoes["notificacoes"][K]) {
    setConfig(p => ({ ...p, notificacoes: { ...p.notificacoes, [k]: v } }));
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
    if (novaSenha !== confirmarSenha) { setErroSenha(tc.account.passwordMismatch); return; }
    if (novaSenha.length < 6) { setErroSenha(tc.account.passwordTooShort); return; }
    setSalvandoSenha(true);
    try {
      await api.put(`/usuario/${usuario!.id}/senha`, { senhaAtual, novaSenha });
      setSenhaAtual(""); setNovaSenha(""); setConfirmarSenha("");
      setSenhaSalva(true);
      setTimeout(() => setSenhaSalva(false), 3000);
    } catch (err: any) {
      setErroSenha(err.response?.data?.message ?? tc.account.passwordMismatch);
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
    } catch { alert(tc.account.exportError); }
  }

  async function excluirConta() {
    const confirmado = excluirRef.current?.value === `@${usuario?.username}`;
    if (!confirmado) { alert(`Digite @${usuario?.username} para confirmar.`); return; }
    if (!confirm(tc.account.deleteConfirmMsg)) return;
    try {
      await api.delete(`/usuario/${usuario!.id}`);
      logout();
      navigate("/");
    } catch (err: any) {
      alert(err?.response?.data?.message ?? "Erro ao excluir conta.");
    }
  }

  const n = config.notificacoes;
  const a = config.aparencia;
  const f = config.feed;
  const r = config.regiao;

  type NotifKey = "curtida" | "comentario" | "seguindo" | "colaboracao" | "colaboracao_catalogo" | "mensagem";
  const tiposNotif: { key: NotifKey; label: string; desc: string }[] = [
    { key: "curtida",              label: tc.notifications.types.curtida,              desc: tc.notifications.types.curtidaDesc },
    { key: "comentario",           label: tc.notifications.types.comentario,           desc: tc.notifications.types.comentarioDesc },
    { key: "seguindo",             label: tc.notifications.types.seguindo,             desc: tc.notifications.types.seguindoDesc },
    { key: "colaboracao",          label: tc.notifications.types.colaboracao,          desc: tc.notifications.types.colaboracaoDesc },
    { key: "colaboracao_catalogo", label: tc.notifications.types.colaboracao_catalogo, desc: tc.notifications.types.colaboracao_catalogoDesc },
    { key: "mensagem",             label: tc.notifications.types.mensagem,             desc: tc.notifications.types.mensagemDesc },
  ];

  return (
    <div className="cfg">
      <div className="cfg__container">
        <div className="cfg__header">
          <SettingsIcon size={22} />
          <h1>{tc.title}</h1>
        </div>

        {/* ── 1. NOTIFICAÇÕES ──────────────────────────────────── */}
        <section className="cfg__secao">
          <div className="cfg__secao-titulo"><BellIcon size={16} /><span>{tc.notifications.title}</span></div>

          <div className="cfg__item cfg__item--master">
            <div className="cfg__item-info">
              <span className="cfg__item-label">{tc.notifications.master}</span>
              <span className="cfg__item-desc">{tc.notifications.masterDesc}</span>
            </div>
            <Toggle checked={n.ativas} onChange={v => setN("ativas", v)} />
          </div>

          <div className={`cfg__lista ${!n.ativas ? "cfg__lista--bloqueada" : ""}`}>
            {tiposNotif.map(tipo => (
              <div key={tipo.key} className="cfg__item">
                <div className="cfg__item-info">
                  <span className="cfg__item-label">{tipo.label}</span>
                  <span className="cfg__item-desc">{tipo.desc}</span>
                </div>
                <Toggle checked={n[tipo.key] as boolean} onChange={v => setN(tipo.key, v)} disabled={!n.ativas} />
              </div>
            ))}
            <div className="cfg__item cfg__item--som">
              <div className="cfg__item-info">
                <span className="cfg__item-label">{tc.notifications.sound}</span>
                <span className="cfg__item-desc">{tc.notifications.soundDesc}</span>
              </div>
              <Toggle checked={n.som} onChange={v => setN("som", v)} disabled={!n.ativas} />
            </div>
          </div>
        </section>

        {/* ── 2. APARÊNCIA ─────────────────────────────────────── */}
        <section className="cfg__secao">
          <div className="cfg__secao-titulo"><PaletteIcon size={16} /><span>{tc.appearance.title}</span></div>

          <div className="cfg__item">
            <div className="cfg__item-info">
              <span className="cfg__item-label">{tc.appearance.theme}</span>
              <span className="cfg__item-desc">{tc.appearance.themeDesc}</span>
            </div>
            <Select<"claro" | "escuro" | "sistema">
              value={a.tema}
              onChange={v => setA("tema", v)}
              options={[
                { value: "claro",   label: tc.appearance.themeOptions.claro },
                { value: "escuro",  label: tc.appearance.themeOptions.escuro },
                { value: "sistema", label: tc.appearance.themeOptions.sistema },
              ]}
            />
          </div>

          <div className="cfg__item">
            <div className="cfg__item-info">
              <span className="cfg__item-label">{tc.appearance.fontSize}</span>
              <span className="cfg__item-desc">{tc.appearance.fontSizeDesc}</span>
            </div>
            <Select<"pequeno" | "medio" | "grande">
              value={a.tamanhoFonte}
              onChange={v => setA("tamanhoFonte", v)}
              options={[
                { value: "pequeno", label: tc.appearance.fontSizeOptions.pequeno },
                { value: "medio",   label: tc.appearance.fontSizeOptions.medio },
                { value: "grande",  label: tc.appearance.fontSizeOptions.grande },
              ]}
            />
          </div>

          <div className="cfg__item">
            <div className="cfg__item-info">
              <span className="cfg__item-label">{tc.appearance.feedDensity}</span>
              <span className="cfg__item-desc">{tc.appearance.feedDensityDesc}</span>
            </div>
            <Select<"confortavel" | "normal" | "compacto">
              value={a.densidadeFeed}
              onChange={v => setA("densidadeFeed", v)}
              options={[
                { value: "confortavel", label: tc.appearance.feedDensityOptions.confortavel },
                { value: "normal",      label: tc.appearance.feedDensityOptions.normal },
                { value: "compacto",    label: tc.appearance.feedDensityOptions.compacto },
              ]}
            />
          </div>
        </section>

        {/* ── 3. FEED ──────────────────────────────────────────── */}
        <section className="cfg__secao">
          <div className="cfg__secao-titulo"><UsersIcon size={16} /><span>{tc.feed.title}</span></div>

          <div className="cfg__item">
            <div className="cfg__item-info">
              <span className="cfg__item-label">{tc.feed.discover}</span>
              <span className="cfg__item-desc">{tc.feed.discoverDesc}</span>
            </div>
            <Toggle checked={f.mostrarDescoberta} onChange={v => setF("mostrarDescoberta", v)} />
          </div>

          <div className="cfg__item">
            <div className="cfg__item-info">
              <span className="cfg__item-label">{tc.feed.order}</span>
              <span className="cfg__item-desc">{tc.feed.orderDesc}</span>
            </div>
            <Select<"recente" | "engajamento">
              value={f.ordem}
              onChange={v => setF("ordem", v)}
              options={[
                { value: "recente",     label: tc.feed.orderOptions.recente },
                { value: "engajamento", label: tc.feed.orderOptions.engajamento },
              ]}
            />
          </div>
        </section>

        {/* ── 4. IDIOMA ─────────────────────────────────────────── */}
        <section className="cfg__secao">
          <div className="cfg__secao-titulo">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>
            <span>{tc.region.title}</span>
          </div>

          <div className="cfg__item">
            <div className="cfg__item-info">
              <span className="cfg__item-label">{tc.region.language}</span>
              <span className="cfg__item-desc">{tc.region.languageDesc}</span>
            </div>
            <Select<"pt-BR" | "en-US">
              value={r.idioma}
              onChange={v => setR("idioma", v)}
              options={[
                { value: "pt-BR", label: tc.region.languageOptions["pt-BR"] },
                { value: "en-US", label: tc.region.languageOptions["en-US"] },
              ]}
            />
          </div>
        </section>

        {/* ── 5. CONTA & SEGURANÇA ─────────────────────────────── */}
        <section className="cfg__secao">
          <div className="cfg__secao-titulo">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            <span>{tc.account.title}</span>
          </div>

          <div className="cfg__subbloco">
            <p className="cfg__sublabel">{tc.account.changeUsername}</p>
            <p className="cfg__item-desc" style={{ marginBottom: 8 }}>{tc.account.currentUsername} <strong>@{usuario?.username}</strong></p>
            <form className="cfg__senha-form" onSubmit={alterarUsername}>
              <input type="text" placeholder={tc.account.usernamePlaceholder} value={novoUsername}
                onChange={e => setNovoUsername(e.target.value)} className="cfg__input" autoComplete="off" />
              {erroUsername && <p className="cfg__erro">{erroUsername}</p>}
              {usernameSalvo && <p className="cfg__sucesso">{tc.account.usernameChanged}</p>}
              <button type="submit" className="cfg__btn-sec" disabled={salvandoUsername}>
                {salvandoUsername ? t.common.saving : tc.account.alterUsernameBtn}
              </button>
            </form>
          </div>

          <div className="cfg__subbloco">
            <p className="cfg__sublabel">{tc.account.changePassword}</p>
            <form className="cfg__senha-form" onSubmit={alterarSenha}>
              <input type="password" placeholder={tc.account.currentPasswordPlaceholder} value={senhaAtual}
                onChange={e => setSenhaAtual(e.target.value)} className="cfg__input" autoComplete="current-password" />
              <input type="password" placeholder={tc.account.newPasswordPlaceholder} value={novaSenha}
                onChange={e => setNovaSenha(e.target.value)} className="cfg__input" autoComplete="new-password" />
              <input type="password" placeholder={tc.account.confirmPasswordPlaceholder} value={confirmarSenha}
                onChange={e => setConfirmarSenha(e.target.value)} className="cfg__input" autoComplete="new-password" />
              {erroSenha && <p className="cfg__erro">{erroSenha}</p>}
              {senhaSalva && <p className="cfg__sucesso">{tc.account.passwordChanged}</p>}
              <button type="submit" className="cfg__btn-sec" disabled={salvandoSenha}>
                {salvandoSenha ? t.common.saving : tc.account.changePasswordBtn}
              </button>
            </form>
          </div>

          <div className="cfg__item">
            <div className="cfg__item-info">
              <span className="cfg__item-label">{tc.account.signOutAll}</span>
              <span className="cfg__item-desc">{tc.account.signOutAllDesc}</span>
            </div>
            <button className="cfg__btn-sec" onClick={() => { logout(); navigate("/login"); }}>
              {tc.account.signOutNow}
            </button>
          </div>

          <div className="cfg__item">
            <div className="cfg__item-info">
              <span className="cfg__item-label">{tc.account.exportData}</span>
              <span className="cfg__item-desc">{tc.account.exportDataDesc}</span>
            </div>
            <button className="cfg__btn-sec" onClick={exportarDados}>{tc.account.export}</button>
          </div>

          <div className="cfg__subbloco cfg__subbloco--perigo">
            <p className="cfg__sublabel cfg__sublabel--perigo">{tc.account.deleteAccount}</p>
            <p className="cfg__item-desc" style={{ marginBottom: 10 }}>{tc.account.deleteAccountDesc}</p>
            <input ref={excluirRef} type="text"
              placeholder={`Digite @${usuario?.username} para confirmar`}
              className="cfg__input cfg__input--perigo" />
            <button className="cfg__btn-perigo" onClick={excluirConta}>
              <TrashIcon size={14} /> {tc.account.deleteAccount}
            </button>
          </div>
        </section>

        <div className="cfg__rodape">
          <button className="cfg__salvar" onClick={salvar} disabled={salvando}>
            {salvando ? tc.saving : salvo ? tc.saved : tc.saveSettings}
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
}
