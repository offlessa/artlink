import { useEffect } from "react";
import "../styles/components/Toast.scss";

interface ToastProps {
  mensagem: string;
  visivel: boolean;
  onFadeOut: () => void;
}

export default function Toast({ mensagem, visivel, onFadeOut }: ToastProps) {
  useEffect(() => {
    if (!visivel) return;
    const t = setTimeout(onFadeOut, 2200);
    return () => clearTimeout(t);
  }, [visivel]);

  if (!visivel) return null;

  return (
    <div className="toast toast--visivel">
      {mensagem}
    </div>
  );
}

export function useToast() {
  return (setter: (v: string) => void, mensagem: string) => {
    setter(mensagem);
    setTimeout(() => setter(""), 2400);
  };
}
