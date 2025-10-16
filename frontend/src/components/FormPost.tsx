import React, { useState } from 'react'
import { createPost } from '../api/post'

export default function FormPost() {
  const [form, setForm] = useState({ usuarioId: '', conteudo: '', imagemUrl: '' })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      await createPost({
        usuarioId: form.usuarioId,
        conteudo: form.conteudo,
        imagemUrl: form.imagemUrl || undefined
      })
      alert('Post criado!')
      setForm({ usuarioId: '', conteudo: '', imagemUrl: '' })
    } catch (err: any) {
      alert(err?.response?.data?.message ?? 'Erro ao criar post')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card">
      <div className="form-row">
        <input placeholder="Seu userId" value={form.usuarioId} onChange={e => setForm({...form, usuarioId: e.target.value})} />
      </div>
      <div className="form-row">
        <textarea placeholder="Conteúdo" value={form.conteudo} onChange={e => setForm({...form, conteudo: e.target.value})} />
      </div>
      <div className="form-row">
        <input placeholder="URL da imagem (opcional)" value={form.imagemUrl} onChange={e => setForm({...form, imagemUrl: e.target.value})} />
      </div>
      <div style={{display:'flex', justifyContent:'flex-end'}}>
        <button type="submit">Publicar</button>
      </div>
    </form>
  )
}
