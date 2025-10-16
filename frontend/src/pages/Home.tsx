import React from 'react'
import FormUsuario from '../components/FormUsuario'

export default function Home() {
  return (
    <div className="container">
      <h1>Bem-vindo ao Artlink</h1>
      <p>Cadastro rápido de usuário:</p>
      <FormUsuario />
    </div>
  )
}
