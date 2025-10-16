import React, { useState } from 'react'
import { enviarMensagem } from '../api/mensagem'

export default function FormMensagem() {
  const [form, setForm] = useState({ remetenteId: '', destinatarioId: '', conteudo: '' })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      await enviarMensagem(form)
      alert('Mensagem enviada!')
      setForm({ remetenteId: '', destinatarioId: '', conteudo: '' })
    } catch (err: any) {
      alert(err?.response?.data?.message ?? 'Erro ao enviar mensagem')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card">
      <div className="form-row">
        <input placeholder="Seu userId" value={form.remetenteId} onChange={e => setForm({...form, remetenteId: e.target.value})} />
        <input placeholder="DestinatárioId" value={form.destinatarioId} onChange={e => setForm({...form, destinatarioId: e.target.value})} />
      </div>
      <div className="form-row">
        <textarea placeholder="Conteúdo" value={form.conteudo} onChange={e => setForm({...form, conteudo: e.target.value})} />
      </div>
      <div style={{display:'flex', justifyContent:'flex-end'}}>
        <button type="submit">Enviar</button>
      </div>
    </form>
  )
}
