import { supabase } from './supabaseClient'

export async function coletarContexto(user_id) {
  // 1. Buscar perfil do usuário
  const { data: perfil, error: perfilError } = await supabase
    .from('user_profile')
    .select('*')
    .eq('id', user_id)
    .single()
  if (perfilError) console.error('Erro ao buscar perfil:', perfilError)

  // 2. Buscar últimos 7 dias de logs
  const { data: logs, error: logsError } = await supabase
    .from('daily_logs')
    .select('*')
    .eq('user_id', user_id)
    .order('data', { ascending: false })
    .limit(7)
  if (logsError) console.error('Erro ao buscar logs:', logsError)

  // 3. Buscar feedback recente
  const { data: feedbacks, error: feedbackError } = await supabase
    .from('behavior_feedback')
    .select('*')
    .eq('user_id', user_id)
    .order('timestamp', { ascending: false })
    .limit(10)
  if (feedbackError) console.error('Erro ao buscar feedback:', feedbackError)

  return {
    perfil,
    logs,
    feedbacks
  }
}
/**
 * Analisar o período dos últimos 7 dias com base nos logs do usuário.
 * @param {Object} contexto - Objeto retornado por coletarContexto()
 * @returns {Object} indicadores - Contagem de refeições, macros, hábitos críticos
 */
export function analisarPeriodo(contexto) {
  const { logs } = contexto
  if (!logs || logs.length === 0) return { mensagem: 'Sem logs recentes', indicadores: {} }

  // Exemplo de cálculo simples: contagem de refeições por dia
  const refeicoesPorDia = {}
  logs.forEach(log => {
    const dia = log.data.split('T')[0] // extrai YYYY-MM-DD
    if (!refeicoesPorDia[dia]) refeicoesPorDia[dia] = 0
    refeicoesPorDia[dia] += 1
  })

  // Exemplo de indicador adicional: média de refeições por dia
  const totalDias = Object.keys(refeicoesPorDia).length
  const totalRefeicoes = logs.length
  const mediaRefeicoesPorDia = totalRefeicoes / totalDias

  // Você pode expandir aqui: calorias, macros, alertas de excesso, horários críticos etc.

  return {
    refeicoesPorDia,
    mediaRefeicoesPorDia,
    totalRefeicoes,
    totalDias
  }
}
