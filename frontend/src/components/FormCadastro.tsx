import React, { useState } from "react";

const FormCadastro: React.FC = () => {
  const [nome, setNome] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mensagem, setMensagem] = useState(""); // mensagem de feedback
  const [erro, setErro] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensagem("");
    setErro(false);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/usuario`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ nome, username, email, senha }),
        }
      );

      const data = await res.json();

      if (data.success) {
        setMensagem(`Usuário "${username}" cadastrado com sucesso!`);
        setNome("");
        setUsername("");
        setEmail("");
        setSenha("");
      } else {
        setMensagem(data.message || "Erro ao cadastrar usuário");
        setErro(true);
      }
    } catch (err) {
      console.error(err);
      setMensagem("Erro de conexão com o servidor");
      setErro(true);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "0 auto", padding: 20 }}>
      <h2>Cadastro de Usuário</h2>
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: 10 }}
      >
        <input
          type="text"
          placeholder="Nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
        />
        <button type="submit" style={{ padding: 8, cursor: "pointer" }}>
          Cadastrar
        </button>
      </form>

      {mensagem && (
        <p
          style={{
            color: erro ? "red" : "green",
            marginTop: 10,
            fontWeight: "bold",
          }}
        >
          {mensagem}
        </p>
      )}
    </div>
  );
};

export default FormCadastro;
