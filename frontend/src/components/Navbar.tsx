import React from "react";
import { Link } from "react-router-dom";
import "../styles/components/Navbar.scss";

export default function Navbar() {
  return (
    <nav className="navbar">
      <Link to="/">Home</Link>
      <Link to="/perfil">Perfil</Link>
      <Link to="/busca">Buscar</Link>
      <Link to="/catalogos">Catálogos</Link>
      <Link to="/cadastro">Cadastro</Link>
    </nav>
  );
}
