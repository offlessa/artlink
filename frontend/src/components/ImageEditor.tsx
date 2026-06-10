import { useEffect, useRef, useState } from "react";
import { XIcon } from "./Icons";
import "../styles/components/ImageEditor.scss";

interface Props {
  file: File;
  aspect?: number;
  circular?: boolean;
  onConfirm: (blob: Blob) => void;
  onCancel: () => void;
}

export default function ImageEditor({ file, aspect = 1, circular = false, onConfirm, onCancel }: Props) {
  const [imgSrc, setImgSrc] = useState("");
  const [imgNat, setImgNat] = useState({ w: 0, h: 0 });
  const [stageSize, setStageSize] = useState({ w: 0, h: 0 });
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [confirming, setConfirming] = useState(false);

  const imgRef = useRef<HTMLImageElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const baseScaleRef = useRef(1);
  const dragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const lastTouch = useRef<{ x: number; y: number } | null>(null);
  const lastPinchDist = useRef<number | null>(null);
  const needsInitRef = useRef(false);

  // Novo arquivo: reseta tudo e marca que precisa inicializar
  useEffect(() => {
    const url = URL.createObjectURL(file);
    setImgSrc(url);
    setImgNat({ w: 0, h: 0 });
    setStageSize({ w: 0, h: 0 });
    setScale(1);
    setOffset({ x: 0, y: 0 });
    needsInitRef.current = true;
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // ResizeObserver: mede o stage depois que o layout CSS (aspect-ratio) estiver finalizado
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      const rect = entries[0].contentRect;
      if (rect.width > 0 && rect.height > 0) {
        setStageSize({ w: rect.width, h: rect.height });
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Inicializa baseScale quando ambas as dimensões estiverem prontas (uma vez por arquivo)
  useEffect(() => {
    if (!needsInitRef.current) return;
    if (imgNat.w === 0 || stageSize.w === 0 || stageSize.h === 0) return;
    needsInitRef.current = false;
    baseScaleRef.current = Math.max(stageSize.w / imgNat.w, stageSize.h / imgNat.h);
    setScale(1);
    setOffset({ x: 0, y: 0 });
  }, [imgNat.w, imgNat.h, stageSize.w, stageSize.h]);

  // Non-passive listeners para que preventDefault funcione em todos os browsers
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const onTouch = (e: TouchEvent) => e.preventDefault();
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const dy = e.deltaMode === 1 ? e.deltaY * 30 : e.deltaMode === 2 ? e.deltaY * 300 : e.deltaY;
      setScale(s => clampScale(s * Math.pow(0.999, dy)));
    };
    el.addEventListener("touchmove", onTouch, { passive: false });
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      el.removeEventListener("touchmove", onTouch);
      el.removeEventListener("wheel", onWheel);
    };
  }, []);

  function clampScale(s: number) { return Math.min(Math.max(s, 1), 3); }

  function onImgLoad() {
    const img = imgRef.current;
    if (!img) return;
    setImgNat({ w: img.naturalWidth, h: img.naturalHeight });
  }

  const ready = imgNat.w > 0 && stageSize.w > 0 && stageSize.h > 0;
  const bs = baseScaleRef.current;
  const rendW = ready ? imgNat.w * bs * scale : 0;
  const rendH = ready ? imgNat.h * bs * scale : 0;
  const imgX = ready ? (stageSize.w - rendW) / 2 + offset.x : 0;
  const imgY = ready ? (stageSize.h - rendH) / 2 + offset.y : 0;

  function clampOffset(o: { x: number; y: number }, sc: number) {
    const mx = Math.max(0, (imgNat.w * bs * sc - stageSize.w) / 2);
    const my = Math.max(0, (imgNat.h * bs * sc - stageSize.h) / 2);
    return { x: Math.min(mx, Math.max(-mx, o.x)), y: Math.min(my, Math.max(-my, o.y)) };
  }

  useEffect(() => {
    if (!ready) return;
    setOffset(o => clampOffset(o, scale));
  }, [scale, stageSize.w, stageSize.h]);

  function onMouseDown(e: React.MouseEvent) {
    dragging.current = true;
    lastPos.current = { x: e.clientX, y: e.clientY };
  }

  function onMouseMove(e: React.MouseEvent) {
    if (!dragging.current) return;
    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;
    lastPos.current = { x: e.clientX, y: e.clientY };
    setOffset(o => clampOffset({ x: o.x + dx, y: o.y + dy }, scale));
  }

  function onMouseUp() { dragging.current = false; }

  function pinchDist(t: React.TouchList) {
    return Math.hypot(t[1].clientX - t[0].clientX, t[1].clientY - t[0].clientY);
  }

  function onTouchStart(e: React.TouchEvent) {
    if (e.touches.length === 1) {
      lastTouch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      lastPinchDist.current = null;
    } else if (e.touches.length === 2) {
      lastPinchDist.current = pinchDist(e.touches);
      lastTouch.current = null;
    }
  }

  function onTouchMove(e: React.TouchEvent) {
    if (e.touches.length === 1 && lastTouch.current) {
      const dx = e.touches[0].clientX - lastTouch.current.x;
      const dy = e.touches[0].clientY - lastTouch.current.y;
      lastTouch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      setOffset(o => clampOffset({ x: o.x + dx, y: o.y + dy }, scale));
    } else if (e.touches.length === 2 && lastPinchDist.current !== null) {
      const dist = pinchDist(e.touches);
      setScale(s => clampScale(s * dist / lastPinchDist.current!));
      lastPinchDist.current = dist;
    }
  }

  function onTouchEnd() {
    lastTouch.current = null;
    lastPinchDist.current = null;
  }

  function confirmar() {
    if (confirming || !imgRef.current || !ready) return;
    setConfirming(true);

    const outW = aspect >= 3 ? 1200 : 1080;
    const outH = Math.round(outW / aspect);
    const canvas = document.createElement("canvas");
    canvas.width = outW;
    canvas.height = outH;
    const ctx = canvas.getContext("2d")!;

    // Fator único para evitar distorção
    const sc = outW / stageSize.w;
    ctx.drawImage(imgRef.current, imgX * sc, imgY * sc, rendW * sc, rendH * sc);

    canvas.toBlob(blob => {
      setConfirming(false);
      if (blob) onConfirm(blob);
    }, "image/jpeg", 0.93);
  }

  const sliderVal = ready ? Math.round((scale - 1) / 2 * 100) : 0;

  return (
    <div className="img-ed-overlay" onClick={e => { if (e.target === e.currentTarget) onCancel(); }}>
      <div className="img-ed">
        <div className="img-ed__header">
          <span>Posicionar imagem</span>
          <button className="img-ed__close" onClick={onCancel}><XIcon size={18} /></button>
        </div>

        <div
          ref={stageRef}
          className={`img-ed__stage${circular ? " img-ed__stage--circular" : ""}`}
          style={{ aspectRatio: String(aspect) }}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {imgSrc && (
            <img
              ref={imgRef}
              src={imgSrc}
              alt=""
              draggable={false}
              onLoad={onImgLoad}
              style={{
                position: "absolute",
                left: ready ? imgX : undefined,
                top: ready ? imgY : undefined,
                width: ready ? rendW : undefined,
                height: ready ? rendH : undefined,
                visibility: ready ? "visible" : "hidden",
                pointerEvents: "none",
                userSelect: "none",
              }}
            />
          )}

          {ready && !circular && (
            <div className="img-ed__grid" aria-hidden="true">
              <span className="img-ed__grid-h" style={{ top: "33.33%" }} />
              <span className="img-ed__grid-h" style={{ top: "66.66%" }} />
              <span className="img-ed__grid-v" style={{ left: "33.33%" }} />
              <span className="img-ed__grid-v" style={{ left: "66.66%" }} />
            </div>
          )}
        </div>

        <div className="img-ed__zoom">
          <button type="button" onClick={() => setScale(s => clampScale(s - 0.15))}>−</button>
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={sliderVal}
            onChange={e => setScale(1 + (Number(e.target.value) / 100) * 2)}
          />
          <button type="button" onClick={() => setScale(s => clampScale(s + 0.15))}>+</button>
        </div>

        <div className="img-ed__actions">
          <button type="button" className="img-ed__btn img-ed__btn--cancel" onClick={onCancel}>Cancelar</button>
          <button
            type="button"
            className="img-ed__btn img-ed__btn--confirm"
            onClick={confirmar}
            disabled={confirming || !ready}
          >
            {confirming ? "Processando..." : "Confirmar"}
          </button>
        </div>
      </div>
    </div>
  );
}
