import { useEffect, useState } from "react";

export default function ColdStartBanner() {
  const [visible, setVisible] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [max, setMax] = useState(5);

  useEffect(() => {
    function handler(e: Event) {
      const { retrying, attempt, max } = (e as CustomEvent).detail;
      setVisible(retrying);
      setAttempt(attempt);
      setMax(max);
    }
    window.addEventListener("api:coldstart", handler);
    return () => window.removeEventListener("api:coldstart", handler);
  }, []);

  if (!visible) return null;

  return (
    <div style={{
      position: "fixed",
      bottom: "1.2rem",
      left: "50%",
      transform: "translateX(-50%)",
      zIndex: 9999,
      background: "#1E2E10",
      color: "#FAF8F3",
      padding: "12px 22px",
      borderRadius: "10px",
      fontSize: "0.85rem",
      fontFamily: "'DM Sans', sans-serif",
      boxShadow: "0 4px 20px rgba(0,0,0,0.35)",
      display: "flex",
      alignItems: "center",
      gap: "10px",
      whiteSpace: "nowrap",
    }}>
      <span style={{ display: "inline-block", animation: "spin 1s linear infinite", fontSize: "1rem" }}>⏳</span>
      Servidor acordando… tentativa {attempt}/{max}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
