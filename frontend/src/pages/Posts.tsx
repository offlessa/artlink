import React from 'react'
import FormPost from '../components/FormPost'

export default function Posts() {
  return (
    <div className="container">
      <h2>Publicar conteúdo</h2>
      <FormPost />
      <hr style={{margin:'20px 0'}} />
      <p>Lista de posts (ainda sem endpoint GET)</p>
    </div>
  )
}
