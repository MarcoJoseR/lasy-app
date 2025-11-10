'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function AdminReceitas() {
  const [receitas, setReceitas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [novaReceita, setNovaReceita] = useState({
    nome: '',
    ingredientes: '',
    modo_preparo: ''
  })

  // 🔹 Carrega as receitas
  async function carregarReceitas() {
    setLoading(true)
    const { data, error } = await supabase.from('receitas').select('*')
    if (error) console.error('Erro ao carregar receitas:', error)
    else setReceitas(data || [])
    setLoading(false)
  }

  useEffect(() => {
    carregarReceitas()
  }, [])

  // 🔹 Adicionar receita
  async function adicionarReceita() {
    if (!novaReceita.nome.trim()) return alert('Nome é obrigatório!')
    const { error } = await supabase.from('receitas').insert([novaReceita])
    if (error) alert('Erro ao adicionar: ' + error.message)
    else {
      alert('Receita adicionada com sucesso!')
      setNovaReceita({ nome: '', ingredientes: '', modo_preparo: '' })
      carregarReceitas()
    }
  }

  // 🔹 Excluir receita
  async function excluirReceita(id: number) {
    if (!confirm('Tem certeza que deseja excluir esta receita?')) return
    const { error } = await supabase.from('receitas').delete().eq('id', id)
    if (error) alert('Erro ao excluir: ' + error.message)
    else {
      alert('Receita excluída com sucesso!')
      carregarReceitas()
    }
  }

  if (loading) return <div className="p-4">🔄 Carregando receitas...</div>

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Painel Administrativo - Receitas</h1>

      {/* 🧩 Formulário de nova receita */}
      <div className="mb-6 border p-4 rounded-lg bg-gray-50">
        <h2 className="text-lg font-semibold mb-2">Adicionar nova receita</h2>
        <input
          type="text"
          placeholder="Nome"
          value={novaReceita.nome}
          onChange={(e) => setNovaReceita({ ...novaReceita, nome: e.target.value })}
          className="border p-2 mr-2 rounded w-1/4"
        />
        <input
          type="text"
          placeholder="Ingredientes"
          value={novaReceita.ingredientes}
          onChange={(e) => setNovaReceita({ ...novaReceita, ingredientes: e.target.value })}
          className="border p-2 mr-2 rounded w-1/3"
        />
        <input
          type="text"
          placeholder="Modo de preparo"
          value={novaReceita.modo_preparo}
          onChange={(e) => setNovaReceita({ ...novaReceita, modo_preparo: e.target.value })}
          className="border p-2 mr-2 rounded w-1/3"
        />
        <button
          onClick={adicionarReceita}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Adicionar
        </button>
      </div>

      {/* 🧾 Tabela de receitas */}
      <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow-md">
        <thead className="bg-gray-100 border-b">
          <tr>
            <th className="p-2 text-left">Nome</th>
            <th className="p-2 text-left">Ingredientes</th>
            <th className="p-2 text-left">Modo de Preparo</th>
            <th className="p-2 text-center">Ações</th>
          </tr>
        </thead>
        <tbody>
          {receitas.map((r) => (
            <tr key={r.id} className="border-b hover:bg-gray-50">
              <td className="p-2">{r.nome}</td>
              <td className="p-2">{r.ingredientes}</td>
              <td className="p-2">{r.modo_preparo}</td>
              <td className="p-2 text-center">
                <button
                  onClick={() => excluirReceita(r.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                >
                  Excluir
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
