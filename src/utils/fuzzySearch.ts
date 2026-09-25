import { Product } from '../types';

// Common fashion synonyms & related terms mapping
const SYNONYM_MAP: Record<string, string[]> = {
  kurti: ['tunic', 'top', 'co-ord', 'coord', 'suit', 'kurta', 'dress', 'shirt'],
  kurtis: ['tunic', 'top', 'co-ord', 'coord', 'suit', 'kurta', 'dress', 'shirt'],
  tunic: ['kurti', 'kurtis', 'top', 'co-ord', 'shirt'],
  abaya: ['kaftan', 'caftan', 'cloak', 'burqa', 'borka', 'gown', 'maxi', 'robe'],
  abayas: ['kaftan', 'caftan', 'cloak', 'burqa', 'borka', 'gown', 'maxi', 'robe'],
  kaftan: ['abaya', 'abayas', 'gown', 'dress'],
  dress: ['maxi', 'gown', 'frock', 'tunic', 'abaya'],
  dresses: ['maxi', 'gown', 'frock', 'tunic', 'abaya'],
  maxi: ['dress', 'dresses', 'gown', 'abaya'],
  hijab: ['scarf', 'shawl', 'headscarf', 'khimar', 'veil', 'cap'],
  hijabs: ['scarf', 'shawl', 'headscarf', 'khimar', 'veil', 'cap'],
  khimar: ['hijab', 'veil', 'scarf', 'cape'],
  bag: ['handbag', 'purse', 'tote', 'clutch', 'crossbody', 'east-west'],
  bags: ['handbag', 'purse', 'tote', 'clutch', 'crossbody', 'east-west'],
  handbag: ['bag', 'bags', 'purse', 'tote', 'crossbody'],
  ring: ['jewelry', 'jewellery', 'accessory', 'gold', 'silver', 'band'],
  rings: ['jewelry', 'jewellery', 'accessory', 'gold', 'silver', 'band'],
  maroon: ['burgundy', 'wine', 'crimson', 'red'],
  white: ['ivory', 'cream', 'pearl', 'off-white'],
  black: ['espresso', 'dark', 'ebony', 'noir'],
};

/**
 * Normalizes string by stripping punctuation and lowercasing
 */
function normalize(str: string): string {
  return (str || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Calculates simple Levenshtein distance for typo tolerance
 */
function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Fuzzy search matches query against a product across title, category, description, and synonyms
 */
export function matchProductFuzzy(product: Product, rawQuery: string): boolean {
  const query = normalize(rawQuery);
  if (!query) return true;

  const queryWords = query.split(' ').filter(Boolean);
  if (queryWords.length === 0) return true;

  // Build searchable target text
  const targetFields = [
    product.name,
    product.subtitle || '',
    product.category,
    product.categoryLabel,
    product.description || '',
    product.fabric || '',
    product.brand || '',
    ...(product.labels || []),
    ...(product.colors?.map((c) => c.name) || []),
  ];
  const targetText = normalize(targetFields.join(' '));
  const targetWords = targetText.split(' ').filter(Boolean);

  // Every word in query should find a match or synonym in target
  return queryWords.every((qWord) => {
    // 1. Direct substring match
    if (targetText.includes(qWord)) return true;

    // 2. Synonyms match (e.g. kurti -> tunic, top, co-ord)
    const synonyms = SYNONYM_MAP[qWord] || [];
    for (const syn of synonyms) {
      if (targetText.includes(syn)) return true;
    }

    // 3. Typo tolerance: compare word with target words if length >= 4
    if (qWord.length >= 4) {
      for (const tWord of targetWords) {
        if (tWord.length >= 3) {
          const maxDist = qWord.length <= 5 ? 1 : 2;
          if (levenshtein(qWord, tWord) <= maxDist) {
            return true;
          }
        }
      }
    }

    return false;
  });
}

/**
 * Filters a product list using fuzzy matching
 */
export function fuzzyFilterProducts(products: Product[], query: string): Product[] {
  if (!query.trim()) return products;
  return products.filter((p) => matchProductFuzzy(p, query));
}
