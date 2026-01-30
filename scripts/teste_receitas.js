import 'dotenv/config';
import { supabase } from '../lib/supabaseClient.js';
import { openai } from '../lib/openaiClient.js';

// Função para gerar embedding
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

// Função para testar uma receita
async function testarReceita(receita) {
  console.log(`\n=== Receita ID ${receita.id}: ${receita.nome} ===`);

  let embedding = receita.embedding_vector;

  if (!embedding || embedding.length === 0) {
    console.log('⚠️ Embedding ausente. Gerando...');
    const texto = `${receita.nome} ${receita.descricao || ''} ${receita.ingredientes_text || ''}`;
    embedding = await gerarEmbedding(texto);

    if (embedding) {
      console.log('✅ Embedding gerado. Atualizando no Supabase...');
      const { error } = await supabase
        .from('receitas')
        .update({ embedding_vector: embedding })
        .eq('id', receita.id);

      if (error) console.error('❌ Erro ao atualizar embedding:', error.message);
    } else {
      console.log('⚠️ Embedding não gerado.');
    }
  } else {
    console.log('✅ Embedding existente.');
  }

  // Testa função RPC de receitas similares
  try {
    console.log('🔍 Buscando receitas similares...');
    const { data, error } = await supabase.rpc('receitas_similares_paginadas', {
      p_receita_id: receita.id,
      receita_embedding: embedding,
      limit_count: 3,
      offset_count: 0,
    });

    if (error) {
      console.error('❌ Erro ao buscar similares:', error.message);
    } else if (!data || data.length === 0) {
      console.log('⚠️ Nenhuma receita similar encontrada.');
    } else {
      console.log(`✅ Receitas semelhantes encontradas: ${data.length}`);
      data.forEach(r =>
        console.log(`   - [${r.receita_id}] ${r.nome} (${r.image_url || 'sem imagem'})`)
      );
    }
  } catch (err) {
    console.error('❌ Erro RPC:', err.message);
  }
}

// Função principal
async function main() {
  try {
    const { data: receitas, error } = await supabase
      .from('receitas')
      .select('*')
      .limit(50); // aumenta para testar mais receitas

    if (error) {
      console.error('❌ Erro ao buscar receitas:', error.message);
      return;
    }

    if (!receitas || receitas.length === 0) {
      console.log('⚠️ Nenhuma receita encontrada no banco.');
      return;
    }

    for (const receita of receitas) {
      await testarReceita(receita);
    }

    console.log('\n✅ Teste finalizado!');
  } catch (err) {
    console.error('❌ Erro inesperado:', err.message);
  }
}

// Executa script
main();
