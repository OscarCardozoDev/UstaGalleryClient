export interface RYBColor {
  r: number // 0–100
  y: number // 0–100
  b: number // 0–100
}

export interface NamedColor extends RYBColor {
  name: string
}

function cubicInt(t: number, a: number, b: number): number {
  return a + (b - a) * t * t * (3 - 2 * t)
}

// Trilinear interpolation through RYB color cube.
// Based on Gossett & Chen paint-mixing model.
function rybToRgb(r: number, y: number, b: number): [number, number, number] {
  const rn = r / 100
  const yn = y / 100
  const bn = b / 100

  let x0 = cubicInt(bn, 1.0, 0.163)
  let x1 = cubicInt(bn, 1.0, 0.0)
  let x2 = cubicInt(bn, 1.0, 0.5)
  let x3 = cubicInt(bn, 1.0, 0.2)
  let y0 = cubicInt(yn, x0, x1)
  let y1 = cubicInt(yn, x2, x3)
  const red = cubicInt(rn, y0, y1)

  x0 = cubicInt(bn, 1.0, 0.373)
  x1 = cubicInt(bn, 1.0, 0.66)
  x2 = cubicInt(bn, 0.0, 0.0)
  x3 = cubicInt(bn, 0.5, 0.094)
  y0 = cubicInt(yn, x0, x1)
  y1 = cubicInt(yn, x2, x3)
  const green = cubicInt(rn, y0, y1)

  x0 = cubicInt(bn, 1.0, 0.6)
  x1 = cubicInt(bn, 0.0, 0.2)
  x2 = cubicInt(bn, 0.0, 0.5)
  x3 = cubicInt(bn, 0.0, 0.0)
  y0 = cubicInt(yn, x0, x1)
  y1 = cubicInt(yn, x2, x3)
  const blue = cubicInt(rn, y0, y1)

  return [
    Math.round(Math.min(1, Math.max(0, red)) * 255),
    Math.round(Math.min(1, Math.max(0, green)) * 255),
    Math.round(Math.min(1, Math.max(0, blue)) * 255),
  ]
}

export function rybToHex(r: number, y: number, b: number): string {
  const [rr, gg, bb] = rybToRgb(r, y, b)
  return `#${rr.toString(16).padStart(2, '0')}${gg.toString(16).padStart(2, '0')}${bb.toString(16).padStart(2, '0')}`
}

// Normalized Euclidean distance in RYB space. Returns [0, 1].
// Max possible distance = sqrt(100² + 100² + 100²) ≈ 173.2
const MAX_DISTANCE = Math.sqrt(3) * 100

export function rybDistance(a: RYBColor, b: RYBColor): number {
  const dr = a.r - b.r
  const dy = a.y - b.y
  const db = a.b - b.b
  return Math.sqrt(dr * dr + dy * dy + db * db) / MAX_DISTANCE
}

export const TARGET_COLORS: NamedColor[] = [
  { name: 'Naranja',          r: 100, y: 60,  b: 0   },
  { name: 'Verde',            r: 0,   y: 60,  b: 100 },
  { name: 'Violeta',          r: 60,  y: 0,   b: 100 },
  { name: 'Ocre',             r: 50,  y: 80,  b: 0   },
  { name: 'Terracota',        r: 80,  y: 40,  b: 10  },
  { name: 'Oliva',            r: 20,  y: 70,  b: 30  },
  { name: 'Magenta',          r: 100, y: 0,   b: 40  },
  { name: 'Turquesa',         r: 0,   y: 30,  b: 100 },
  { name: 'Siena',            r: 70,  y: 50,  b: 5   },
  { name: 'Coral',            r: 100, y: 30,  b: 10  },
  { name: 'Verde lima',       r: 0,   y: 90,  b: 30  },
  { name: 'Índigo',           r: 20,  y: 0,   b: 100 },
  { name: 'Ámbar',            r: 80,  y: 90,  b: 0   },
  { name: 'Carmín',           r: 100, y: 0,   b: 20  },
  { name: 'Musgo',            r: 10,  y: 50,  b: 40  },
  { name: 'Melocotón',        r: 100, y: 60,  b: 10  },
  { name: 'Azul cobalto',     r: 5,   y: 0,   b: 80  },
  { name: 'Verde bosque',     r: 5,   y: 40,  b: 60  },
  { name: 'Lavanda',          r: 30,  y: 0,   b: 60  },
  { name: 'Dorado',           r: 60,  y: 100, b: 0   },
  { name: 'Bordó',            r: 100, y: 0,   b: 30  },
  { name: 'Cian',             r: 0,   y: 50,  b: 100 },
  { name: 'Salmón',           r: 100, y: 40,  b: 15  },
  { name: 'Verde jade',       r: 0,   y: 45,  b: 70  },
  { name: 'Púrpura',          r: 80,  y: 0,   b: 100 },
  { name: 'Amarillo verdoso', r: 0,   y: 100, b: 20  },
  { name: 'Rojo oscuro',      r: 100, y: 10,  b: 5   },
  { name: 'Azul pizarra',     r: 10,  y: 10,  b: 80  },
  { name: 'Naranja tostado',  r: 90,  y: 45,  b: 0   },
  { name: 'Verde cazador',    r: 5,   y: 55,  b: 50  },
]
