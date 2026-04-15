export interface ArtStyle {
  name: string;
  description: string;
  extract: string;
  image?: string;
  lastUpdated: number;
}

const WIKI_BASE = "https://en.wikipedia.org/api/rest_v1/page/summary";

// 🔹 Cache en memoria (puedes migrar a Redis luego)
const cache = new Map<string, ArtStyle>();

// 🔹 TTL cache (1 día)
const CACHE_TTL = 1000 * 60 * 60 * 24;

// 🔹 Lista base (puedes luego reemplazar con Artsy)
const DEFAULT_STYLES = [
  "Impressionism",
  "Cubism",
  "Surrealism",
  "Renaissance",
  "Baroque",
  "Expressionism",
  "Minimalism",
  "Romanticism",
  "Neoclassicism",
  "Abstract art",
  "Futurism",
  "Dadaism",
  "Pop Art",
  "Art Nouveau",
  "Constructivism",
  "Bauhaus",
];

// ─────────────────────────────────────────────
// 🔹 Utils
// ─────────────────────────────────────────────

const isCacheValid = (style: ArtStyle) => {
  return Date.now() - style.lastUpdated < CACHE_TTL;
};

const cleanText = (text: string): string => {
  return text
    ?.replace(/\s+/g, " ")
    ?.replace(/\[[^\]]*\]/g, "") // elimina [1], [citation]
    ?.trim();
};

// ─────────────────────────────────────────────
// 🔹 Fetch individual style
// ─────────────────────────────────────────────
export const getArtStyleByName = async (name: string): Promise<ArtStyle> => {
  const normalized = name.trim();

  // 🔹 Cache hit
  const cached = cache.get(normalized);
  if (cached && isCacheValid(cached)) {
    return cached;
  }

  try {
    const res = await fetch(`${WIKI_BASE}/${encodeURIComponent(normalized)}`);

    if (!res.ok) {
      throw new Error(`Wikipedia error: ${res.status}`);
    }

    const data = await res.json();

    const style: ArtStyle = {
      name: normalized,
      description: cleanText(data.description || ""),
      extract: cleanText(data.extract || "No description available"),
      image: data.thumbnail?.source,
      lastUpdated: Date.now(),
    };

    // 🔹 Guardar en cache
    cache.set(normalized, style);

    return style;
  } catch (error) {
    console.error(`Error loading style: ${normalized}`, error);

    return {
      name: normalized,
      description: "",
      extract: "No se pudo cargar la información.",
      lastUpdated: Date.now(),
    };
  }
};

// ─────────────────────────────────────────────
// 🔹 Fetch all styles
// ─────────────────────────────────────────────
export const getArtStyles = async (
  search?: string, 
  limit?: number
): Promise<ArtStyle[]> => {
  let results: ArtStyle[];

  if (search && search.trim()) {
    // Búsqueda
    const all = await Promise.all(
      DEFAULT_STYLES.map((style) => getArtStyleByName(style))
    );
    results = all.filter((style) =>
      style.name.toLowerCase().includes(search.toLowerCase())
    );
  } else {
    // Lista completa
    results = await Promise.all(
      DEFAULT_STYLES.map((style) => getArtStyleByName(style))
    );
  }

  // Ordenar alfabéticamente
  results.sort((a, b) => a.name.localeCompare(b.name));

  // Aplicar límite si existe
  return limit ? results.slice(0, limit) : results;
};


// ─────────────────────────────────────────────
// 🔹 Búsqueda (para futuro input search)
// ─────────────────────────────────────────────

export const searchArtStyles = async (query: string): Promise<ArtStyle[]> => {
  if (!query.trim()) return [];

  const all = await getArtStyles();

  return all.filter((style) =>
    style.name.toLowerCase().includes(query.toLowerCase())
  );
};

// ─────────────────────────────────────────────
// 🔹 Random styles for homepage
// ─────────────────────────────────────────────
export const getRandomArtStyles = async (count: number = 3): Promise<ArtStyle[]> => {
  const all = await Promise.all(
    DEFAULT_STYLES.map((style) => getArtStyleByName(style))
  );

  // Shuffle array
  const shuffled = all.sort(() => Math.random() - 0.5);
  
  return shuffled.slice(0, count);
};

// ─────────────────────────────────────────────
// 🔹 Clear cache (debug / admin)
// ─────────────────────────────────────────────

export const clearArtStylesCache = () => {
  cache.clear();
};