// src/pages/Cadastro.tsx
import React, { useState } from "react";
import "../styles/components/Cadastro.scss";

export default function Cadastro() {
  const [nome, setNome] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError(false);

    try {
      const response = await fetch("http://localhost:3000/usuario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, username, email, senha }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage("Cadastro realizado com sucesso!");
        setNome("");
        setUsername("");
        setEmail("");
        setSenha("");
      } else {
        setError(true);
        setMessage(data.message || "Erro ao cadastrar.");
      }
    } catch (err) {
      setError(true);
      setMessage("Erro na conexão com o servidor.");
    }
  };

  return (
    <div className="cadastro-container">
      <h2>Cadastro de Usuário</h2>
      {message && (
        <div className={`message ${error ? "error" : "success"}`}>
          {message}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <label>
          Nome
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
          />
        </label>

        <label>
          Username
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </label>

        <label>
          E-mail
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>

        <label>
          Senha
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
          />
        </label>

        <button type="submit">Cadastrar</button>
      </form>
    </div>
  );
}
