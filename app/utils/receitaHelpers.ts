export function transformarIngredientes(
  texto: string | string[] | undefined | null
) {
  if (Array.isArray(texto)) {
    return texto;
  }

  if (!texto) {
    return [];
  }

  return String(texto)
    .split(/\n+/)
    .map((i) => i.trim())
    .filter((i) => i !== "");
}

export function transformarPassos(
  texto: string | string[] | undefined | null
) {
  if (Array.isArray(texto)) {
    return texto;
  }

  if (!texto) {
    return [];
  }

  return String(texto)
    .split(/\n+/)
    .map((p) => p.trim())
    .filter((p) => p !== "");
}