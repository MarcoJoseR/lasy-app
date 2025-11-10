import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Carrega variáveis do .env.script
dotenv.config({ path: path.resolve(__dirname, '../.env.script') });

// Validação das variáveis de ambiente
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('❌ Supabase URL ou SERVICE_ROLE_KEY não definidos no .env.script');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Caminho do backup
const backupPath = path.join(__dirname, '..', 'backup_receitas.json');

async function main() {
  try {
    // Lê backup
    const data = fs.readFileSync(backupPath, 'utf-8');
    const receitas = JSON.parse(data);

    // Remove duplicatas pelo nome
    const receitasUnicasMap = new Map<string, any>();
    for (const receita of receitas) {
      if (!receitasUnicasMap.has(receita.nome)) {
        receitasUnicasMap.set(receita.nome, receita);
      }
    }

    const receitasUnicas = Array.from(receitasUnicasMap.values());
    console.log(`Total de receitas originais: ${receitas.length}`);
    console.log(`Total de receitas únicas: ${receitasUnicas.length}`);

    // Atualiza cada receita no Supabase
    for (const receita of receitasUnicas) {
      const { id, nome, categoria, tempo, ingredientes } = receita;

      const { error } = await supabase
        .from('receitas')
        .upsert({
          id,
          nome,
          categoria,
          tempo,
          ingredientes,
        });

      if (error) {
        console.error(`❌ Erro ao atualizar receita ${nome}:`, error.message);
      } else {
        console.log(`✅ Receita ${nome} atualizada com sucesso.`);
      }
    }

    console.log('🎯 Todas as receitas únicas foram aplicadas ao Supabase.');
  } catch (error) {
    console.error('Erro ao processar receitas únicas:', error);
  }
}

main();
