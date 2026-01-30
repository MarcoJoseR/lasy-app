// preenche-embeddings.js
import dotenv from 'dotenv';
dotenv.config({ path: './.env' }); // força carregar o .env da raiz

import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

// Checagem de variáveis
console.log('SUPABASE_URL:', process.env.SUPABASE_URL);
console.log('SUPABASE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'ok' : 'undefined');
console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? 'ok' : 'undefined');

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.OPENAI_API_KEY) {
  console.error('Erro: Variáveis de ambiente ausentes. Verifique seu .env');
  process.exit(1);
}

// Inicializa clientes
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Função para gerar embedding
async function gerarEmbedding(texto) {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: texto
    });
    return response.data[0].embedding;
  } catch (error) {
    console.error('Erro ao gerar embedding:', error.message);
    return null;
  }
}

// Função para atualizar embedding no Supabase
async function atualizarEmbedding(receitaId, embedding) {
  const { error } = await supabase
    .from('receitas')
    .update({ embedding_vector: embedding })  // <-- usando o nome correto da coluna
    .eq('id', receitaId);

  if (error) console.error(`Erro ao atualizar receita ${receitaId}:`, error.message);
  else console.log(`✅ Receita ${receitaId} atualizada com sucesso`);
}

// Função principal
async function preencherEmbeddings() {
  console.log('Buscando receitas...');
  const { data: receitas, error } = await supabase
    .from('receitas')
    .select('id, descricao');

  if (error) {
    console.error('Erro ao buscar receitas:', error.message);
    return;
  }

  console.log(`Total de receitas encontradas: ${receitas.length}`);

  for (const receita of receitas) {
    if (!receita.descricao) {
      console.log(`Receita ID ${receita.id} sem descrição, pulando...`);
      continue;
    }

    console.log(`Gerando embedding para receita ID ${receita.id}...`);
    const embedding = await gerarEmbedding(receita.descricao);

    if (embedding) {
      await atualizarEmbedding(receita.id, embedding);
    } else {
      console.log(`❌ Falha ao gerar embedding para receita ID ${receita.id}`);
    }
  }

  console.log('Todos os embeddings foram processados!');
}

// Executa
preencherEmbeddings().catch((err) => console.error('Erro inesperado:', err.message));
