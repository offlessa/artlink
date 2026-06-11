import { useEffect } from "react";
import { XIcon } from "./Icons";
import "../styles/components/FotoLightbox.scss";

interface Props {
  src: string;
  alt?: string;
  onClose: () => void;
}

export default function FotoLightbox({ src, alt, onClose }: Props) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="lightbox" onClick={onClose}>
      <button className="lightbox__close" onClick={onClose}><XIcon size={20} /></button>
      <img
        className="lightbox__img"
        src={src}
        alt={alt ?? ""}
        onClick={e => e.stopPropagation()}
      />
    </div>
  );
}
