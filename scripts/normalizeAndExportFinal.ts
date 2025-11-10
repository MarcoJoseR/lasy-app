// normalizeAndExportFinal.ts
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';
import { Parser } from 'json2csv';

// Carregar variáveis do .env.script
dotenv.config({ path: path.resolve(__dirname, '../.env.script') });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Supabase URL ou SERVICE_ROLE_KEY não definidos no .env.script');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

interface Receita {
  id: number;
  nome: string;
  categoria: string;
  tempo: string;
  ingredientes: string[];
}

function normalizeIngredient(ing: string): string {
  return ing
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove acentos
    .toLowerCase();
}

function normalizeIngredientsList(ings: string[]): string[] {
  return ings.map(normalizeIngredient);
}

async function main() {
  // 1️⃣ Buscar todas as receitas
  const { data: receitas, error } = await supabase
    .from<Receita>('receitas')
    .select('*');

  if (error) {
    console.error('Erro ao buscar receitas:', error.message);
    return;
  }

  if (!receitas || receitas.length === 0) {
    console.log('Nenhuma receita encontrada no banco.');
    return;
  }

  // 2️⃣ Criar backup
  const backupPath = path.join(__dirname, 'backup_receitas.json');
  fs.writeFileSync(backupPath, JSON.stringify(receitas, null, 2));
  console.log('✅ Backup criado em:', backupPath);

  // 3️⃣ Normalizar ingredientes
  const normalizedMap = receitas.map(r => ({
    ...r,
    ingredientes: normalizeIngredientsList(r.ingredientes)
  }));

  // 4️⃣ Remover duplicatas por nome (mantendo a primeira ocorrência)
  const uniqueMap: Receita[] = [];
  const seenNames = new Set<string>();

  for (const r of normalizedMap) {
    if (!seenNames.has(r.nome)) {
      uniqueMap.push(r);
      seenNames.add(r.nome);
    }
  }

  // 5️⃣ Atualizar no Supabase
  for (const r of uniqueMap) {
    const { error } = await supabase
      .from('receitas')
      .update({ ingredientes: r.ingredientes })
      .eq('id', r.id);

    if (error) console.error(`❌ Erro ao atualizar receita ${r.nome}:`, error.message);
    else console.log(`✅ Receita ${r.nome} atualizada.`);
  }

  // 6️⃣ Gerar CSV final
  const csvFields = ['nome', 'categoria', 'tempo', 'ingredientes'];
  const csvParser = new Parser({ fields: csvFields });

  const csvData = uniqueMap.map(r => ({
    ...r,
    ingredientes: r.ingredientes.join('; ')
  }));

  const csv = csvParser.parse(csvData);
  const csvPath = path.join(__dirname, 'receitas_normalizadas_final.csv');
  fs.writeFileSync(csvPath, csv);
  console.log('✅ CSV final gerado em:', csvPath);
}

main().catch(err => console.error('Erro no script:', err));
