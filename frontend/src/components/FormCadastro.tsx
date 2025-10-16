import React, { useState } from "react";

const FormCadastro: React.FC = () => {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mensagem, setMensagem] = useState("");

  const apiUrl = import.meta.env.VITE_API_URL;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMensagem("");

    try {
      const response = await fetch(`${apiUrl}/usuario`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, email, senha }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setMensagem(
          `Erro: ${errorData.message || "Não foi possível cadastrar"}`
        );
        return;
      }

      const data = await response.json();
      setMensagem(`Usuário ${data.nome} cadastrado com sucesso!`);

      // Limpar formulário
      setNome("");
      setEmail("");
      setSenha("");
    } catch (err) {
      setMensagem("Erro na conexão com o servidor.");
      console.error(err);
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "2rem auto" }}>
      <h2>Cadastro de Usuário</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
          style={{ width: "100%", padding: "0.5rem", marginBottom: "1rem" }}
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ width: "100%", padding: "0.5rem", marginBottom: "1rem" }}
        />
        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
          style={{ width: "100%", padding: "0.5rem", marginBottom: "1rem" }}
        />
        <button type="submit" style={{ padding: "0.5rem 1rem" }}>
          Cadastrar
        </button>
      </form>
      {mensagem && <p style={{ marginTop: "1rem" }}>{mensagem}</p>}
    </div>
  );
};

export default FormCadastro;
