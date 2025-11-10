// scripts/removeDuplicateRecipes.ts
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { Parser } from 'json2csv';

// Carrega .env.script da raiz do projeto
const envPath = path.resolve(process.cwd(), '.env.script');
dotenv.config({ path: envPath });
console.log('Carregando variáveis de ambiente de:', envPath);

// Leitura segura das variáveis
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Validação básica
if (!supabaseUrl || !supabaseKey) {
  console.error('❌ SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY ausentes no .env.script');
  console.error('Verifique o conteúdo de:', envPath);
  process.exit(1);
}

// Mostra confirmação de carregamento (não imprime a chave completa)
const maskedKey = `${supabaseKey.slice(0, 6)}...${supabaseKey.slice(-6)}`;
console.log('SUPABASE_URL:', supabaseUrl);
console.log('SUPABASE_SERVICE_ROLE_KEY (masked):', maskedKey);

// Cria cliente Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

// Caminhos absolutos
const backupPath = path.resolve(process.cwd(), 'backup_receitas.json');
const csvPath = path.resolve(process.cwd(), 'receitas_unicas_final.csv');

async function testConnection() {
  try {
    // Teste simples: tentar ler 1 registro da tabela receitas
    const { data, error } = await supabase.from('receitas').select('id').limit(1);
    if (error) throw error;
    console.log('✅ Teste de conexão com Supabase: OK (consulta de exemplo retornou).');
    return true;
  } catch (err: any) {
    console.error('❌ Falha no teste de conexão com Supabase:', err.message || err);
    return false;
  }
}

async function main() {
  try {
    // 1) Testa conexão antes de prosseguir
    const ok = await testConnection();
    if (!ok) {
      console.error('Abortando: verifique SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env.script.');
      process.exit(1);
    }

    // 2) Verifica se o arquivo de backup existe
    if (!fs.existsSync(backupPath)) {
      throw new Error(`Arquivo de backup não encontrado: ${backupPath}`);
    }

    // 3) Lê backup
    const raw = fs.readFileSync(backupPath, 'utf-8');
    const receitas = JSON.parse(raw);

    // 4) Remove duplicatas por nome (mantém a primeira ocorrência)
    const map = new Map<string, any>();
    for (const r of receitas) {
      const nome = (r.nome ?? '').toString();
      if (!map.has(nome)) map.set(nome, r);
    }
    const receitasUnicas = Array.from(map.values());

    console.log(`Total de receitas originais: ${receitas.length}`);
    console.log(`Total de receitas únicas: ${receitasUnicas.length}`);

    // 5) Atualiza/insere no Supabase (upsert)
    for (const receita of receitasUnicas) {
      const { id, nome, categoria, tempo, ingredientes, modo_preparo, imagem_url } = receita;
      const payload = { id, nome, categoria, tempo, ingredientes, modo_preparo, imagem_url };

      const { error } = await supabase.from('receitas').upsert(payload);
      if (error) {
        console.error(`❌ Erro ao atualizar receita "${nome}":`, error.message || error);
      } else {
        console.log(`✅ Receita "${nome}" atualizada/ inserida com sucesso.`);
      }
    }

    // 6) Gera CSV final (ingredientes como string legível)
    const csvRows = receitasUnicas.map(r => ({
      id: r.id,
      nome: r.nome,
      categoria: r.categoria ?? '',
      tempo: r.tempo ?? '',
      ingredientes: Array.isArray(r.ingredientes) ? r.ingredientes.join(' ; ') : (r.ingredientes ?? '')
    }));

    const parser = new Parser({ fields: ['id', 'nome', 'categoria', 'tempo', 'ingredientes'] });
    const csv = parser.parse(csvRows);
    fs.writeFileSync(csvPath, csv, 'utf-8');
    console.log(`✅ CSV final gerado em: ${csvPath}`);

    console.log('🎯 Operação concluída: backup lido, duplicatas removidas, banco atualizado e CSV gerado.');
  } catch (err: any) {
    console.error('Erro no processo:', err.message ?? err);
    process.exit(1);
  }
}

main();
