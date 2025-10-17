import React, { useEffect, useState } from "react";

interface Usuario {
  id: number;
  nome: string;
  username: string;
  email: string;
  bio?: string;
  cidade?: string;
  contato?: string;
  fotoPerfil?: string;
}

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUsuarios() {
      try {
        const response = await fetch("http://localhost:3000/usuarios");
        const data = await response.json();
        if (data.success) {
          setUsuarios(data.data);
        } else {
          setErro(data.message || "Erro ao carregar usuários.");
        }
      } catch (error) {
        setErro("Erro na conexão com o servidor.");
      } finally {
        setLoading(false);
      }
    }

    fetchUsuarios();
  }, []);

  if (loading) return <p>Carregando usuários...</p>;
  if (erro) return <p style={{ color: "red" }}>{erro}</p>;

  return (
    <div style={{ padding: 20 }}>
      <h2>Lista de Usuários</h2>
      {usuarios.length === 0 ? (
        <p>Nenhum usuário encontrado.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {usuarios.map((u) => (
            <li
              key={u.id}
              style={{
                marginBottom: 10,
                padding: 10,
                border: "1px solid #ddd",
                borderRadius: 8,
              }}
            >
              <strong>{u.nome}</strong> ({u.username})
              <br />
              <small>{u.email}</small>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
