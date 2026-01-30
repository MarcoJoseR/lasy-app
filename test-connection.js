import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Carrega ambos os arquivos de configuração
dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local' });

// Verificação de variáveis obrigatórias
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente faltando:');
  if (!supabaseUrl) console.error(' - NEXT_PUBLIC_SUPABASE_URL não encontrada');
  if (!supabaseKey) console.error(' - SUPABASE_SERVICE_ROLE_KEY não encontrada');
  process.exit(1);
}

// Inicializa cliente Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

async function testarConexao() {
  console.log("🔍 Testando conexão com Supabase...\n");

  const { data, error } = await supabase
    .from('receitas')
    .select('id, titulo')
    .limit(5);

  if (error) {
    console.error("❌ Erro na consulta:", error);
  } else {
    console.log("✅ Conexão OK! Dados recebidos:");
    console.table(data);
  }
}

// Executa teste
testarConexao();
