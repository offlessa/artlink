import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import Perfil from "./pages/Perfil";
import Busca from "./pages/Busca";
import FormCadastro from "./components/FormCadastro";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow p-4 flex justify-between items-center">
        <div className="flex gap-4">
          <Link className="font-semibold hover:text-blue-500" to="/">
            Home
          </Link>
          <Link className="font-semibold hover:text-blue-500" to="/perfil">
            Perfil
          </Link>
          <Link className="font-semibold hover:text-blue-500" to="/busca">
            Busca
          </Link>
          <Link className="font-semibold hover:text-blue-500" to="/cadastro">
            Cadastro
          </Link>
        </div>
      </nav>
      <main className="p-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/busca" element={<Busca />} />
          <Route path="/cadastro" element={<FormCadastro />} />
        </Routes>
      </main>
    </div>
  );
}
