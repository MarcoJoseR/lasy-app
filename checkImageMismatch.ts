// C:\supabase-app\checkImageMismatch.ts
import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function checkImages() {
  // Buscar todas as imagens da tabela
  const { data: receitas, error } = await supabase
    .from("receitas")
    .select("id, nome, imagem");

  if (error) {
    console.error("Erro ao buscar receitas:", error);
    return;
  }

  // Caminho base da pasta de imagens
  const baseDir = path.join(__dirname, "public/images/receitas");

  receitas?.forEach((r) => {
    if (!r.imagem) return;

    // Extrair nome do arquivo esperado do banco (sem extensão)
    const expectedName = path.basename(r.imagem).replace(/\.[^.]+$/, "");

    // Procurar arquivos na pasta
    const subDirs = fs.readdirSync(baseDir, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .map(d => d.name);

    let found = false;
    for (const dir of subDirs) {
      const files = fs.readdirSync(path.join(baseDir, dir));
      if (files.some(f => f.replace(/\.[^.]+$/, "") === expectedName)) {
        found = true;
        break;
      }
    }

    if (!found) {
      console.log(`❌ Arquivo não encontrado para receita "${r.nome}" -> imagem: ${r.imagem}`);
    } else {
      console.log(`✅ Imagem OK: "${r.nome}"`);
    }
  });
}

checkImages();
