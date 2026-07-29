const SEP = "::";

/** Combine taille + couleur dans une seule chaîne stockée dans le champ `size` existant. */
export function encodeVariant(size: string | null, color: string | null): string | null {
  if (!size && !color) return null;
  return `${size ?? ""}${SEP}${color ?? ""}`;
}

/** Sépare la chaîne stockée en { size, color }. Compatible avec les anciennes commandes (pas de séparateur → juste une taille, pas de couleur). */
export function decodeVariant(raw: string | null | undefined): { size: string | null; color: string | null } {
  if (!raw) return { size: null, color: null };
  if (!raw.includes(SEP)) return { size: raw, color: null };
  const [size, color] = raw.split(SEP);
  return { size: size || null, color: color || null };
}

/** Retrouve le hex correspondant à un nom de couleur à partir du JSON stocké sur Product.color. */
export function resolveColorHex(productColorJson: string | null | undefined, colorName: string | null): string {
  if (!colorName || !productColorJson) return "#888888";
  try {
    const options = JSON.parse(productColorJson);
    if (Array.isArray(options)) {
      const match = options.find(
        (c: any) => c?.name?.toLowerCase() === colorName.toLowerCase()
      );
      if (match?.hex) return match.hex;
    }
  } catch {
    // ancien format texte libre, pas de JSON valide
  }
  return "#888888";
}