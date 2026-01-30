import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { parse } from 'json2csv';

// --- Configuração Supabase ---
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// --- Configuração OpenAI ---
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// --- Configuração ---
const BATCH_SIZE = 50; // receitas por lote
const MAX_POR_PAIS = 2000; // máximo de receitas por país
const LOG_FILE = path.join(process.cwd(), 'log_embeddings.csv'); // arquivo CSV

// --- Função para gerar embedding ---
async function gerarEmbedding(texto) {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: texto,
    });
    return response.data[0].embedding;
  } catch (err) {
    console.error('❌ Erro ao gerar embedding:', err.message);
    return null;
  }
}

// --- Função para processar receita ---
async function processarReceita(receita, logArray) {
  let embedding = receita.embedding_vector;
  let status = 'existente';

  if (!embedding || embedding.length === 0) {
    const texto = `${receita.nome} ${receita.descricao || ''} ${receita.ingredientes_text || ''}`;
    embedding = await gerarEmbedding(texto);

    if (embedding) {
      const { error } = await supabase
        .from('receitas')
        .update({ embedding_vector: embedding })
        .eq('id', receita.id);

      if (error) {
        console.error(`❌ Erro ao atualizar receita ID ${receita.id}:`, error.message);
        status = 'erro atualização';
      } else {
        console.log(`✅ Embedding atualizado para receita ID ${receita.id}`);
        status = 'atualizado';
      }
    } else {
      console.log(`⚠️ Embedding não gerado para receita ID ${receita.id}`);
      status = 'erro geração';
    }
  } else {
    console.log(`✅ Embedding existente para receita ID ${receita.id}`);
  }

  logArray.push({
    id: receita.id,
    nome: receita.nome,
    pais: receita.pais || 'Desconhecido',
    status: status
  });
let ingredientes = receita.ingredientes_text;

// Se não existir texto útil, deixa como NULL
if (!ingredientes || ingredientes.trim().length === 0) {
  ingredientes = null;
}
// Atualiza no banco apenas se for necessário
await supabase
  .from('receitas')
  .update({ ingredientes_text: ingredientes })
  .eq('id', receita.id);
}
// --- Função para buscar receitas de um país ---
async function buscarReceitasPais(pais, limit = BATCH_SIZE, offset = 0) {
  const { data, error } = await supabase
    .from('receitas')
    .select('*')
    .eq('pais', pais)
    .range(offset, offset + limi
