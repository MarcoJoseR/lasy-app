// importar-lasy.js
import fetch from 'node-fetch';
import fs from 'fs';

const receitas = JSON.parse(fs.readFileSync('./receitas-lasy.json', 'utf-8'));

async function importarReceitas() {
  for (const r of receitas) {
    try {
      const response = await fetch('http://localhost:3000/api/adicionar-receita', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...r, origem: 'lasy' })
      });
      const data = await response.json();
      console.log('Receita adicionada:', data);
    } catch (err) {
      console.error('Erro ao adicionar receita:', r.nome, err);
    }
  }
  console.log('Importação concluída');
}

importarReceitas();
