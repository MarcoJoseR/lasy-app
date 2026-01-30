// pages/index.js
import Image from 'next/image'
import { useEffect } from 'react'
import { coletarContexto, analisarPeriodo } from '../services/motor'

export default function Home() {
  useEffect(() => {
    const testarMotor = async () => {
      try {
        const user_id = 1 // Altere para um ID existente no Supabase
        const contexto = await coletarContexto(user_id)
        const indicadores = analisarPeriodo(contexto)
        console.log('Indicadores do período:', indicadores)
      } catch (error) {
        console.error('Erro ao testar o Motor:', error)
      }
    }

    testarMotor()
  }, [])

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Lasy - Teste do Motor</h1>
      <p>Abra o console do navegador para ver os indicadores do período.</p>

      <Image
        src="/images/receitas/bebidas/gin-cereja.jpg"
        width={400}
        height={300}
      />
    </div>
  )
}
