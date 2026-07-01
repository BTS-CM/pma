/**
 * Prediction market classification constants.
 *
 * Keys are language-agnostic snake_case IDs stored on-chain in
 * `options.description.category` and `options.description.subcategory`.
 * Display names are resolved via i18n: `t("Predictions:categories.<key>")`
 * and `t("Predictions:subcategories.<key>")`.
 */
export const CATEGORIES = {
  "politics": [
    "elections",
    "international",
    "policy",
    "government",
    "geopolitics",
    "other",
  ],
  "culture": [
    "movies",
    "music",
    "awards",
    "collectibles",
    "people",
    "television",
    "video_games",
    "other",
  ],
  "sports": [
    "american_football",
    "basketball",
    "baseball",
    "football_soccer",
    "tennis",
    "mma_boxing",
    "golf",
    "hockey",
    "cricket",
    "rugby",
    "formula_1",
    "motorsport",
    "olympics",
    "esports",
    "other",
  ],
  "crypto": [
    "bitcoin",
    "ethereum",
    "bitshares",
    "defi",
    "nfts",
    "altcoins",
    "regulation",
    "other",
  ],
  "finance": [
    "fed",
    "gdp",
    "global_central_banks",
    "growth",
    "housing",
    "inflation",
    "jobs_economy",
    "stocks",
    "bonds",
    "commodities",
    "forex",
    "other",
  ],
  "commodities": {
    "oil_and_gas": ["brent_crude", "gasoline", "natural_gas", "wti_crude"],
    "metals": ["copper", "gold", "silver", "platinum"],
    "agriculture": ["corn", "soybeans", "wheat", "coffee"],
  },
  "science_and_technology": [
    "ai",
    "machine_learning",
    "space",
    "climate",
    "biotech",
    "cybersecurity",
    "quantum_computing",
    "robotics",
    "ev",
    "energy",
    "nuclear",
    "genomics",
    "neuroscience",
    "blockchain",
    "semiconductors",
    "telecom",
    "other",
  ],
  "weather": [
    "local",
    "global",
    "hurricanes",
    "tornadoes",
    "flooding",
    "drought",
    "heatwaves",
    "blizzards",
    "wildfires",
    "monsoons",
    "el_nino",
    "sea_levels",
    "air_quality",
    "other",
  ],
  "other": [],
};

export const CATEGORY_KEYS = Object.keys(CATEGORIES);

/**
 * Returns the subcategory list for a given category key.
 * Commodities uses a nested structure, so flatten its values.
 */
export function getSubcategories(category) {
  const val = CATEGORIES[category];
  if (!val) return [];
  if (Array.isArray(val)) return val;
  if (typeof val === "object") {
    return Object.values(val).flat();
  }
  return [];
}
