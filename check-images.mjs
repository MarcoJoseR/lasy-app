import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Inicializa Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkImages() {
  console.log('🔍 Verificando imagens das receitas...');

  try {
    const { data: receitas, error } = await supabase
      .from('receitas')
      .select('id, titulo, imagem_url');

    if (error) {
      console.error('❌ Erro ao buscar receitas:', error);
      return;
    }

    const basePath = path.join(process.cwd(), 'public');

    for (const receita of receitas) {
      if (!receita.imagem_url) {
        console.log(`❌ Nenhuma imagem definida para receita ID ${receita.id} (${receita.titulo})`);
        continue;
      }

      let relativePath = receita.imagem_url;
      if (relativePath.startsWith('/')) relativePath = relativePath.slice(1);

      const fullPath = path.join(basePath, relativePath);

      if (fs.existsSync(fullPath)) {
        console.log(`✅ Encontrada: ${receita.imagem_url}`);
      } else {
        console.log(`❌ Não encontrada: ${receita.imagem_url}`);
      }
    }

    console.log('✅ Finalizado.');
  } catch (err) {
    console.error('❌ Erro inesperado:', err);
  }
}

checkImages();
