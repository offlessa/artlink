import React, { useState } from 'react'
import { createUsuario } from '../api/usuario'

export default function FormUsuario() {
  const [form, setForm] = useState({ nome: '', email: '', senha: '' })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      await createUsuario(form)
      alert('Usuário criado com sucesso!')
      setForm({ nome: '', email: '', senha: '' })
    } catch (err: any) {
      alert(err?.response?.data?.message ?? 'Erro ao criar usuário')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card">
      <div className="form-row">
        <input placeholder="Nome" value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} />
      </div>
      <div className="form-row">
        <input placeholder="Email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
      </div>
      <div className="form-row">
        <input type="password" placeholder="Senha" value={form.senha} onChange={e => setForm({...form, senha: e.target.value})} />
      </div>
      <div style={{display:'flex', justifyContent:'flex-end'}}>
        <button type="submit">Cadastrar</button>
      </div>
    </form>
  )
}
