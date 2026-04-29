// ─────────────────────────────────────────────
// 🔹 Estructura de periodos históricos
// ─────────────────────────────────────────────

export interface ArtPeriod {
  id: string;
  name: string;
  startYear: number;
  endYear: number;
  description: string;
  styles: string[]; // nombres de estilos asociados
  keyArtists?: string[];
  region?: string;
  image?: string;
  lastUpdated: number;
}

const ART_PERIODS: ArtPeriod[] = [
  {
    id: "prehistoric",
    name: "Prehistoric Art",
    startYear: -40000,
    endYear: -3000,
    description: "Cave paintings, Venus figurines, megaliths",
    styles: ["Cave painting", "Megalithic art"],
    region: "Global",
  },
  {
    id: "ancient",
    name: "Ancient Art",
    startYear: -3000,
    endYear: 500,
    description: "Egyptian, Greek, Roman civilizations",
    styles: ["Ancient Egyptian art", "Ancient Greek art", "Ancient Roman art"],
    region: "Mediterranean, Middle East",
  },
  {
    id: "medieval",
    name: "Medieval Art",
    startYear: 500,
    endYear: 1400,
    description: "Byzantine, Romanesque, Gothic",
    styles: ["Byzantine art", "Romanesque art", "Gothic art"],
    region: "Europe, Byzantine Empire",
  },
  {
    id: "renaissance",
    name: "Renaissance",
    startYear: 1400,
    endYear: 1600,
    description: "Rebirth of classical ideals, humanism",
    styles: ["Renaissance", "Mannerism"],
    keyArtists: ["Leonardo da Vinci", "Michelangelo", "Raphael"],
    region: "Italy, Northern Europe",
  },
  {
    id: "baroque",
    name: "Baroque",
    startYear: 1600,
    endYear: 1750,
    description: "Drama, movement, tension, grandeur",
    styles: ["Baroque"],
    keyArtists: ["Caravaggio", "Rembrandt", "Bernini"],
    region: "Europe",
  },
  {
    id: "neoclassicism",
    name: "Neoclassicism & Romanticism",
    startYear: 1750,
    endYear: 1850,
    description: "Return to classical order vs emotional expression",
    styles: ["Neoclassicism", "Romanticism"],
    region: "Europe",
  },
  {
    id: "modern-early",
    name: "Early Modern",
    startYear: 1850,
    endYear: 1910,
    description: "Impressionism, Post-Impressionism, Art Nouveau",
    styles: ["Impressionism", "Post-Impressionism", "Art Nouveau"],
    keyArtists: ["Monet", "Van Gogh", "Cézanne"],
    region: "France, Europe",
  },
  {
    id: "modern-mid",
    name: "Modern Art",
    startYear: 1910,
    endYear: 1960,
    description: "Cubism, Expressionism, Surrealism, Abstract",
    styles: ["Cubism", "Expressionism", "Surrealism", "Abstract art", "Dada"],
    keyArtists: ["Picasso", "Dalí", "Kandinsky"],
    region: "Global",
  },
  {
    id: "contemporary",
    name: "Contemporary Art",
    startYear: 1960,
    endYear: 2024,
    description: "Pop Art, Minimalism, Conceptual, Digital",
    styles: ["Pop art", "Minimalism", "Conceptual art", "Digital art"],
    region: "Global",
  },
];

// ─────────────────────────────────────────────
// 🔹 GET /api/art-history/timeline
// Retorna todos los periodos ordenados
// ─────────────────────────────────────────────
export const getArtTimeline = async (): Promise<ArtPeriod[]> => {
  return ART_PERIODS.sort((a, b) => a.startYear - b.startYear);
};

// ─────────────────────────────────────────────
// 🔹 GET /api/art-history/period/:id
// Obtener periodo específico con estilos hidratados
// ─────────────────────────────────────────────
export const getArtPeriodById = async (
  id: string,
): Promise<ArtPeriod | null> => {
  const period = ART_PERIODS.find((p) => p.id === id);

  if (!period) return null;

  // Opcional: hidratar con info de Wikipedia del periodo
  // ...similar a getArtStyleByName pero para periodos

  return period;
};

// ─────────────────────────────────────────────
// 🔹 GET /api/art-history/period/:id/styles
// Obtener estilos completos de un periodo
// ─────────────────────────────────────────────
export const getStylesByPeriod = async (
  periodId: string,
): Promise<ArtStyle[]> => {
  const period = ART_PERIODS.find((p) => p.id === periodId);

  if (!period) return [];

  const styles = await Promise.all(
    period.styles.map((styleName) => getArtStyleByName(styleName)),
  );

  return styles;
};
