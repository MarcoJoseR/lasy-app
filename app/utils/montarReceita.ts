import { limparTexto } from "./limparTexto";
import {
  transformarIngredientes,
  transformarPassos,
} from "./receitaHelpers";

export function montarReceita({
  id,
  nome,
  categoria,
  subCategoria,
  imagem,
  ingredientesTexto,
  modoPreparoTexto,
  tempo,
  porcoes,
  origem,
  favorito = false,
}: {
  id: string;
  nome: string;
  categoria: string;
  subCategoria?: string;
  imagem: string;
  ingredientesTexto: string;
  modoPreparoTexto: string | string[];
  tempo: string;
  porcoes: string;
  origem?: string;
  favorito?: boolean;
}) {

 const modoPreparoNormalizado = Array.isArray(modoPreparoTexto)
  ? modoPreparoTexto.join("\n")
  : modoPreparoTexto || "";

  return {
  id,
  nome: limparTexto(nome),
  categoria,
  subCategoria: subCategoria || "",
  imagem,
  ingredientes: transformarIngredientes(ingredientesTexto),
  modoPreparo: transformarPassos(modoPreparoNormalizado),
  tempo,
  porcoes,
  origem: origem || "",
  favorito,
  tipo: "pessoal" as const,
};
}