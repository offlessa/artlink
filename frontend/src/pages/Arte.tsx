import { useEffect, useState, useMemo, useRef } from "react";
import { api } from "../api/api";
import { useI18n } from "../hooks/useI18n";
import PostCard from "../components/PostCard";
import Footer from "../components/Footer";
import "../styles/components/Arte.scss";

interface Post {
  id: number;
  titulo: string;
  descricao?: string;
  imagem?: string;
  imagens?: string[];
  thumbnails?: string[];
  tags?: string[];
  curtidas: { id: number; usuarioId: number }[];
  comentarios: { id: number }[];
  autor: { id: number; nome: string; username: string; fotoPerfil?: string };
}

export default function Arte() {
  const t = useI18n();
  const [posts, setPosts] = useState<Post[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [categoria, setCategoria] = useState<string | null>(null);
  const [busca, setBusca] = useState("");

  const tagsRef = useRef<HTMLDivElement>(null);
  const autoScrollTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const scrollPaused = useRef(false);
  const isDraggingTag = useRef(false);
  const tagDragStartX = useRef(0);
  const tagDragScrollLeft = useRef(0);
  const hasDraggedTag = useRef(false);

  async function carregarPosts() {
    setCarregando(true);
    try {
      const res = await api.get("/post");
      const dados: Post[] = Array.isArray(res.data) ? res.data : [];
      setPosts(dados);
    } catch {
      setPosts([]);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => { carregarPosts(); }, []);

  const todasTags = useMemo(() => {
    const set = new Set<string>();
    posts.forEach(p => p.tags?.forEach(tag => set.add(tag)));
    return Array.from(set).slice(0, 10);
  }, [posts]);

  function stopTagScroll() {
    if (autoScrollTimer.current) { clearInterval(autoScrollTimer.current); autoScrollTimer.current = null; }
  }
  function startTagScroll() {
    stopTagScroll();
    autoScrollTimer.current = setInterval(() => {
      const el = tagsRef.current;
      if (!el || scrollPaused.current) return;
      el.scrollLeft += 1;
      if (el.scrollLeft >= el.scrollWidth / 2) el.scrollLeft = 0;
    }, 18);
  }
  useEffect(() => {
    if (todasTags.length > 0) startTagScroll();
    return stopTagScroll;
  }, [todasTags.length]);

  function onTagStripMouseEnter() { scrollPaused.current = true; }
  function onTagStripMouseLeave() { scrollPaused.current = false; isDraggingTag.current = false; }
  function onTagStripMouseDown(e: React.MouseEvent) {
    const el = tagsRef.current; if (!el) return;
    isDraggingTag.current = true; hasDraggedTag.current = false;
    tagDragStartX.current = e.pageX - el.getBoundingClientRect().left;
    tagDragScrollLeft.current = el.scrollLeft;
  }
  function onTagStripMouseMove(e: React.MouseEvent) {
    if (!isDraggingTag.current || !tagsRef.current) return;
    e.preventDefault();
    const x = e.pageX - tagsRef.current.getBoundingClientRect().left;
    const walk = x - tagDragStartX.current;
    if (Math.abs(walk) > 4) hasDraggedTag.current = true;
    tagsRef.current.scrollLeft = tagDragScrollLeft.current - walk;
  }
  function onTagStripMouseUp() { isDraggingTag.current = false; }
  function onTagStripTouchStart() { scrollPaused.current = true; }
  function onTagStripTouchEnd() { scrollPaused.current = false; }

  const filtrados = useMemo(() => {
    let lista = categoria ? posts.filter(p => p.tags?.includes(categoria)) : posts;
    if (busca.trim()) {
      const q = busca.trim().toLowerCase();
      lista = lista.filter(p =>
        p.titulo.toLowerCase().includes(q) ||
        p.descricao?.toLowerCase().includes(q) ||
        p.tags?.some(t => t.toLowerCase().includes(q))
      );
    }
    return [...lista].sort((a, b) => b.curtidas.length - a.curtidas.length);
  }, [posts, categoria, busca]);

  return (
    <div className="arte">
      <div className="arte__header">
        <h1 className="arte__titulo">{t.art.title}</h1>
        <p className="arte__sub">{t.art.subtitle}</p>
      </div>

      <div className="arte__body">
        <div className="arte__search-wrap">
          <input
            className="arte__search"
            type="search"
            placeholder="Buscar artes..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
          />
        </div>

        {/* Filtros */}
        <div className="arte__filters">
          <button
            className={`arte__pill arte__pill--fixed ${!categoria ? "arte__pill--ativo" : ""}`}
            onClick={() => setCategoria(null)}
          >
            {t.art.all}
          </button>
          {todasTags.length > 0 && (
            <div
              className="arte__tags-strip"
              ref={tagsRef}
              onMouseEnter={onTagStripMouseEnter}
              onMouseLeave={onTagStripMouseLeave}
              onMouseDown={onTagStripMouseDown}
              onMouseMove={onTagStripMouseMove}
              onMouseUp={onTagStripMouseUp}
              onTouchStart={onTagStripTouchStart}
              onTouchEnd={onTagStripTouchEnd}
            >
              {[...todasTags, ...todasTags].map((tag, i) => (
                <button
                  key={i}
                  className={`arte__pill ${categoria === tag ? "arte__pill--ativo" : ""}`}
                  onClick={() => { if (!hasDraggedTag.current) setCategoria(c => c === tag ? null : tag); }}
                  onDragStart={e => e.preventDefault()}
                >
                  #{tag}
                </button>
              ))}
            </div>
          )}
        </div>

        {carregando ? (
          <div className="arte__grid">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="arte__skeleton" />
            ))}
          </div>
        ) : filtrados.length === 0 ? (
          <div className="arte__vazio">
            <p>{t.art.empty}</p>
          </div>
        ) : (
          <div className="arte__grid">
            {filtrados.map(post => (
              <PostCard
                key={post.id}
                id={post.id}
                titulo={post.titulo}
                descricao={post.descricao}
                imagem={post.imagem}
                imagens={post.imagens}
                thumbnails={post.thumbnails}
                curtidas={post.curtidas}
                autor={post.autor}
                onCurtidaChange={carregarPosts}
              />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
