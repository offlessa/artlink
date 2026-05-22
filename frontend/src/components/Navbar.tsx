import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { SearchIcon, UserIcon, LogOutIcon } from "./Icons";
import "../styles/components/Navbar.scss";

export default function Navbar() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const [busca, setBusca] = useState("");
  const [menuAberto, setMenuAberto] = useState(false);

  function handleBusca(e: React.FormEvent) {
    e.preventDefault();
    if (busca.trim()) {
      navigate(`/busca?q=${encodeURIComponent(busca.trim())}`);
      setBusca("");
    }
  }

  function handleLogout() {
    logout();
    navigate("/login");
  }

  const inicial = usuario?.nome?.charAt(0).toUpperCase() ?? "?";

  return (
    <nav className="navbar">
      <Link to="/" className="navbar__logo">ARTLINK</Link>

      <form className="navbar__search" onSubmit={handleBusca}>
        <SearchIcon size={15} className="navbar__search-icon" />
        <input
          type="text"
          placeholder="Pesquisar..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
        {busca && (
          <button type="button" className="navbar__search-clear" onClick={() => setBusca("")}>
            &times;
          </button>
        )}
      </form>

      <div className="navbar__links">
        <Link to="/">Arte</Link>
        <Link to="/artistas">Artistas</Link>
        <Link to="/sobre">Sobre nós</Link>
      </div>

      {usuario ? (
        <div className="navbar__user" onClick={() => setMenuAberto(!menuAberto)}>
          <div className="navbar__avatar">
            {usuario.fotoPerfil
              ? <img src={usuario.fotoPerfil} alt={usuario.nome} />
              : <span>{inicial}</span>
            }
          </div>
          <span className="navbar__username">{usuario.username}</span>

          {menuAberto && (
            <div className="navbar__dropdown">
              <Link to="/perfil" onClick={() => setMenuAberto(false)}>
                <UserIcon size={14} /> Meu Perfil
              </Link>
              <button onClick={handleLogout}>
                <LogOutIcon size={14} /> Sair
              </button>
            </div>
          )}
        </div>
      ) : (
        <Link to="/login" className="navbar__entrar">Entrar</Link>
      )}
    </nav>
  );
}
