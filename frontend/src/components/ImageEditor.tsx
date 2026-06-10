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
  const [stageSize, setStageSize] = useState({ w: 380, h: 380 });
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

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setImgSrc(url);
    setScale(1);
    setOffset({ x: 0, y: 0 });
    setImgNat({ w: 0, h: 0 });
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // Register passive:false touchmove on the stage to allow preventDefault
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const prevent = (e: TouchEvent) => e.preventDefault();
    el.addEventListener("touchmove", prevent, { passive: false });
    return () => el.removeEventListener("touchmove", prevent);
  }, []);

  function onImgLoad() {
    const img = imgRef.current;
    const el = stageRef.current;
    if (!img || !el) return;
    const natW = img.naturalWidth;
    const natH = img.naturalHeight;
    const rect = el.getBoundingClientRect();
    const sw = rect.width;
    const sh = rect.height;
    setImgNat({ w: natW, h: natH });
    setStageSize({ w: sw, h: sh });
    baseScaleRef.current = Math.max(sw / natW, sh / natH);
    setScale(1);
    setOffset({ x: 0, y: 0 });
  }

  function clamp(o: { x: number; y: number }, sc: number, sw: number, sh: number, natW: number, natH: number) {
    const bs = baseScaleRef.current;
    const rw = natW * bs * sc;
    const rh = natH * bs * sc;
    const mx = Math.max(0, (rw - sw) / 2);
    const my = Math.max(0, (rh - sh) / 2);
    return { x: Math.min(mx, Math.max(-mx, o.x)), y: Math.min(my, Math.max(-my, o.y)) };
  }

  useEffect(() => {
    if (imgNat.w === 0) return;
    setOffset(o => clamp(o, scale, stageSize.w, stageSize.h, imgNat.w, imgNat.h));
  }, [scale, stageSize.w, stageSize.h]);

  const bs = baseScaleRef.current;
  const rendW = imgNat.w * bs * scale;
  const rendH = imgNat.h * bs * scale;
  const imgX = (stageSize.w - rendW) / 2 + offset.x;
  const imgY = (stageSize.h - rendH) / 2 + offset.y;

  function onMouseDown(e: React.MouseEvent) {
    dragging.current = true;
    lastPos.current = { x: e.clientX, y: e.clientY };
  }

  function onMouseMove(e: React.MouseEvent) {
    if (!dragging.current) return;
    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;
    lastPos.current = { x: e.clientX, y: e.clientY };
    setOffset(o => clamp({ x: o.x + dx, y: o.y + dy }, scale, stageSize.w, stageSize.h, imgNat.w, imgNat.h));
  }

  function onMouseUp() { dragging.current = false; }

  function onWheel(e: React.WheelEvent) {
    e.preventDefault();
    const delta = -e.deltaY * 0.001;
    setScale(s => Math.min(Math.max(s + delta, 1), 4));
  }

  function pinchDist(touches: React.TouchList) {
    return Math.hypot(touches[1].clientX - touches[0].clientX, touches[1].clientY - touches[0].clientY);
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
      setOffset(o => clamp({ x: o.x + dx, y: o.y + dy }, scale, stageSize.w, stageSize.h, imgNat.w, imgNat.h));
    } else if (e.touches.length === 2 && lastPinchDist.current !== null) {
      const dist = pinchDist(e.touches);
      const ratio = dist / lastPinchDist.current;
      lastPinchDist.current = dist;
      setScale(s => Math.min(Math.max(s * ratio, 1), 4));
    }
  }

  function onTouchEnd() {
    lastTouch.current = null;
    lastPinchDist.current = null;
  }

  function confirmar() {
    if (confirming || !imgRef.current || imgNat.w === 0) return;
    setConfirming(true);

    const BASE = aspect >= 3 ? 1200 : 800;
    const outW = Math.round(BASE);
    const outH = Math.round(BASE / aspect);

    const canvas = document.createElement("canvas");
    canvas.width = outW;
    canvas.height = outH;
    const ctx = canvas.getContext("2d")!;
    const scaleX = outW / stageSize.w;
    const scaleY = outH / stageSize.h;

    ctx.drawImage(imgRef.current, imgX * scaleX, imgY * scaleY, rendW * scaleX, rendH * scaleY);

    canvas.toBlob(blob => {
      setConfirming(false);
      if (blob) onConfirm(blob);
    }, "image/jpeg", 0.92);
  }

  return (
    <div className="img-ed-overlay" onClick={e => { if (e.target === e.currentTarget) onCancel(); }}>
      <div className="img-ed">
        <div className="img-ed__header">
          <span>Posicionar imagem</span>
          <button className="img-ed__close" onClick={onCancel}><XIcon size={18} /></button>
        </div>

        <p className="img-ed__hint">Arraste para reposicionar · scroll ou pinça para zoom</p>

        <div
          ref={stageRef}
          className={`img-ed__stage${circular ? " img-ed__stage--circular" : ""}`}
          style={{ aspectRatio: String(aspect) }}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          onWheel={onWheel}
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
                left: imgX,
                top: imgY,
                width: rendW || undefined,
                height: rendH || undefined,
                pointerEvents: "none",
                userSelect: "none",
              }}
            />
          )}
        </div>

        <div className="img-ed__zoom">
          <button type="button" onClick={() => setScale(s => Math.max(s - 0.1, 1))}>−</button>
          <input
            type="range"
            min={100}
            max={400}
            step={5}
            value={Math.round(scale * 100)}
            onChange={e => setScale(Number(e.target.value) / 100)}
          />
          <button type="button" onClick={() => setScale(s => Math.min(s + 0.1, 4))}>+</button>
        </div>

        <div className="img-ed__actions">
          <button type="button" className="img-ed__btn img-ed__btn--cancel" onClick={onCancel}>Cancelar</button>
          <button
            type="button"
            className="img-ed__btn img-ed__btn--confirm"
            onClick={confirmar}
            disabled={confirming || imgNat.w === 0}
          >
            {confirming ? "Processando..." : "Confirmar"}
          </button>
        </div>
      </div>
    </div>
  );
}
