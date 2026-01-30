import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

import { createClient } from '@supabase/supabase-js';
import gerarEmbedding from '../lib/gerarEmbedding.js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function gerarTodosEmbeddings() {
  console.log('🔍 Buscando receitas sem embedding...');

  const { data: receitas, error } = await supabase
    .from('receitas')
    .select('id, descricao, embedding');

  if (error) {
    console.error('❌ Erro ao buscar receitas:', error);
    return;
  }

  for (const receita of receitas) {
    if (receita.embedding) {
      console.log(`➡️ Receita ${receita.id} já possui embedding. Ignorando.`);
      continue;
    }

    console.log(`\n=== Receita ID ${receita.id} ===`);
    console.log(`⚠️ Embedding ausente. Gerando...`);

    try {
      const embedding = await gerarEmbedding(receita.descricao);

      const { error: updateErr } = await supabase
        .from('receitas')
        .update({ embedding })
        .eq('id', receita.id);

      if (updateErr) {
        console.error('❌ Erro ao salvar embedding:', updateErr);
        continue;
      }

      console.log(`✅ Embedding salvo com sucesso!`);
    } catch (err) {
      console.error('❌ Erro ao gerar embedding:', err);
    }
  }

  console.log('\n🎉 Processo finalizado.');
}

gerarTodosEmbeddings();
