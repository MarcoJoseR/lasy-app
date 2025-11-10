import { supabase } from '@/lib/supabaseClient'

export default async function TestePage() {
  const { data, error } = await supabase.from('profiles').select('*').limit(1)

  if (error) {
    return <div>❌ Erro: {error.message}</div>
  }

  return (
    <div>
      <h1>✅ Conexão Supabase funcionando!</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  )
}