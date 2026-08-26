// ─── Indian Grocery Multilingual & Phonetic Synonym Dictionary ────────────────
export const GROCERY_SYNONYM_MAP: { [key: string]: string[] } = {
  // Atta / Wheat / Flour
  'atta': ['atta', 'aata', 'gehu', 'gehun', 'wheat', 'flour', 'chakki', 'aata flour', 'aata 5kg', 'aashirvaad'],
  'aata': ['atta', 'aata', 'gehu', 'gehun', 'wheat', 'flour', 'chakki', 'aashirvaad'],
  'wheat': ['atta', 'aata', 'gehu', 'flour', 'chakki'],
  'flour': ['atta', 'aata', 'maida', 'suji', 'besan', 'wheat', 'flour'],

  // Rice / Chawal / Poha
  'rice': ['rice', 'chawal', 'chawal', 'basmati', 'poha', 'paddy', 'rozana', 'daawat', 'fortune'],
  'chawal': ['rice', 'chawal', 'basmati', 'poha'],
  'poha': ['poha', 'pohe', 'chirma', 'rice flakes'],

  // Dal / Pulses
  'dal': ['dal', 'daal', 'pulse', 'pulses', 'moong', 'chana', 'toor', 'arhar', 'urad', 'masoor', 'rajma', 'chole'],
  'daal': ['dal', 'daal', 'pulse', 'pulses', 'moong', 'chana', 'toor'],

  // Cooking Oil / Ghee / Tel
  'oil': ['oil', 'tel', 'tael', 'ghee', 'refined', 'mustard', 'sunflower', 'groundnut', 'soyabean', 'fortune'],
  'tel': ['oil', 'tel', 'tael', 'ghee', 'refined', 'mustard'],
  'tael': ['oil', 'tel', 'tael', 'ghee', 'refined'],
  'ghee': ['ghee', 'ghi', 'cow ghee', 'desi ghee', 'oil', 'makhan', 'amul'],

  // Noodles / Maggi
  'maggi': ['maggi', 'maggy', 'meggi', 'noodle', 'noodles', '2-min', 'pasta'],
  'maggy': ['maggi', 'maggy', 'meggi', 'noodle', 'noodles'],
  'meggi': ['maggi', 'maggy', 'meggi', 'noodle', 'noodles'],
  'noodles': ['maggi', 'noodle', 'noodles', 'hakka', 'chowmein', 'yippee'],

  // Biscuits / Cookies
  'biscuit': ['biscuit', 'biscut', 'biskut', 'biskit', 'cookies', 'parle', 'britannia', 'good day', '2020'],
  'biscut': ['biscuit', 'biscut', 'biskut', 'cookies', 'parle'],
  'biskut': ['biscuit', 'biscut', 'biskut', 'cookies', 'parle'],
  'cookies': ['biscuit', 'cookies', 'cookie', 'bakery'],

  // Detergent / Washing Powder / Soap
  'detergent': ['detergent', 'surf', 'washing powder', 'tide', 'surf excel', 'ariel', 'wheel', 'ghadi', 'sabun'],
  'surf': ['surf', 'detergent', 'washing powder', 'tide', 'ariel'],
  'sabun': ['soap', 'sabun', 'detergent', 'bath soap', 'lux', 'dettol', 'lifebuoy', 'pears'],
  'soap': ['soap', 'sabun', 'bath soap', 'lux', 'dettol', 'wild stone', 'pears', 'body wash'],

  // Shampoo / Hair Care
  'shampoo': ['shampoo', 'shapoo', 'shampu', 'conditioner', 'clinic plus', 'dove', 'sunsilk', 'head & shoulders'],
  'shapoo': ['shampoo', 'shapoo', 'shampu', 'conditioner'],

  // Dairy / Milk / Doodh / Curd
  'milk': ['milk', 'doodh', 'dudh', 'dairy', 'curd', 'dahi', 'paneer', 'butter', 'amul'],
  'doodh': ['milk', 'doodh', 'dudh', 'dairy'],
  'dudh': ['milk', 'doodh', 'dudh', 'dairy'],
  'curd': ['curd', 'dahi', 'yogurt', 'milk'],
  'dahi': ['curd', 'dahi', 'yogurt'],

  // Snacks / Namkeen / Chips
  'namkeen': ['namkeen', 'bhujia', 'chips', 'farsan', 'snack', 'snacks', 'bikaji', 'haldiram', '420'],
  'chips': ['chips', 'wafer', 'lays', 'kurkure', 'bingo', 'namkeen', 'snacks'],

  // Spices / Masala / Haldi
  'masala': ['masala', 'spice', 'spices', 'haldi', 'mirch', 'dhaniya', 'jeera', 'garam masala', 'mdh', 'everest'],
  'haldi': ['haldi', 'turmeric', 'masala', 'spice'],
  'mirch': ['mirch', 'mirchi', 'chilli', 'chili', 'masala'],
  'jeera': ['jeera', 'cumin', 'masala']
};

/**
 * Calculates Levenshtein Distance for fuzzy typo matching (e.g. maggy -> maggi)
 */
export function levenshteinDistance(a: string, b: string): number {
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
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Expands user query with Hinglish/Phonetic synonyms & typo tolerance
 */
export function expandGroceryQuery(userQuery: string): string[] {
  const cleanQuery = userQuery.toLowerCase().trim();
  if (!cleanQuery) return [];

  const tokens = cleanQuery.split(/\s+/);
  const searchTerms = new Set<string>([cleanQuery, ...tokens]);

  tokens.forEach(token => {
    // 1. Direct Synonym Lookup
    if (GROCERY_SYNONYM_MAP[token]) {
      GROCERY_SYNONYM_MAP[token].forEach(s => searchTerms.add(s));
    }

    // 2. Fuzzy Dictionary Matching (distance <= 2)
    Object.keys(GROCERY_SYNONYM_MAP).forEach(key => {
      if (levenshteinDistance(token, key) <= 2) {
        searchTerms.add(key);
        GROCERY_SYNONYM_MAP[key].forEach(s => searchTerms.add(s));
      }
    });
  });

  return Array.from(searchTerms);
}
