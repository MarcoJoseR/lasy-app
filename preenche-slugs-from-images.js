// preenche-slugs-from-images.js
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const PUBLIC_IMAGES_DIR = path.join(process.cwd(), 'public', 'images', 'receitas');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY  // service_role required for writes
);

function getAllImageFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(getAllImageFiles(fullPath));
    } else {
      // só imagens - ignorar arquivos não jpg/png
      const ext = path.extname(entry.name).toLowerCase();
      if (['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext)) {
        files.push(fullPath);
      }
    }
  }
  return files;
}

async function run() {
  const files = getAllImageFiles(PUBLIC_IMAGES_DIR);
  console.log(`Arquivos encontrados: ${files.length}`);

  for (const f of files) {
    // ex: C:\...\public\images\receitas\bebidas\gin-cereja.jpg
    const rel = path.relative(path.join(process.cwd(), 'public'), f).split(path.sep).join('/');
    const filename = path.basename(f);
    const slugValue = filename; // mantendo com extensão, se preferir sem, use filename.replace(/\.[^/.]+$/, "")
    // caso queira sem extensão (recomendado para slug): 
    const slugSemExt = filename.replace(/\.[^/.]+$/, '');

    // procure receita por nome da imagem (campo imagem_url ou outra coluna que você use)
    // estratégia: atualizar a coluna slug com slugSemExt onde imagem_url termina com rel ou filename.
    // Ajuste os nomes das colunas conforme seu esquema: aqui assumo 'imagem_url' e 'slug' e 'id'.
    try {
      const { data, error } = await supabase
        .from('receitas')
        .select('id, imagem_url, slug')
        .ilike('imagem_url', `%${filename}%`)
        .limit(1);

      if (error) {
        console.error('Erro ao buscar receita para', filename, error);
        continue;
      }

      if (data && data.length > 0) {
        const rec = data[0];
        // Atualiza slug para nome do arquivo sem extensão
        const { error: upErr } = await supabase
          .from('receitas')
          .update({ slug: slugSemExt })
          .eq('id', rec.id);

        if (upErr) {
          console.error('Erro ao atualizar slug para', filename, upErr);
        } else {
          console.log(`Atualizado slug: ${rec.id} -> ${slugSemExt}`);
        }
      } else {
        // Se não encontrar por imagem_url, você pode inserir um log para análise manual
        console.log('Nenhuma receita encontrada vinculada a imagem:', filename, '=> relPath:', rel);
      }
    } catch (err) {
      console.error('Erro geral para', filename, err);
    }
  }

  console.log('Finalizado.');
}

run().catch(console.error);
