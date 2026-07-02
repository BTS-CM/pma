/**
 * Prediction market classification constants.
 *
 * Keys are language-agnostic snake_case IDs stored on-chain in
 * `options.description.category` and `options.description.subcategory`.
 * Display names are resolved via i18n: `t("Predictions:categories.<key>")`
 * and `t("Predictions:subcategories.<key>")`.
 */
export const CATEGORIES = {
  "science_and_technology": [
    "ai",
    "machine_learning",
    "space_exploration",
    "climate",
    "biotech_and_genomics",
    "cybersecurity",
    "quantum_computing",
    "robotics",
    "consumer_tech",
    "scientific_milestones",
    "other",
  ],
  "culture_and_media": [
    "movies",
    "box_office",
    "music",
    "awards",
    "television",
    "video_games",
    "publishing",
    "other",
  ],
  "internet_and_trends": [
    "social_media",
    "creator_economy",
    "streaming",
    "viral_trends",
    "subscriber_milestones",
    "other",
  ],
  "weather_and_nature": [
    "local_weather",
    "global_climate",
    "storms_and_hurricanes",
    "temperature_anomalies",
    "other",
  ],
  "web3_ecosystem": [
    "network_upgrades",
    "defi_protocols",
    "nfts",
    "airdrops",
    "governance_proposals",
    "other",
  ],
  "miscellaneous": [],
};

export const CATEGORY_KEYS = Object.keys(CATEGORIES);

/**
 * Returns the subcategory list for a given category key.
 */
export function getSubcategories(category) {
  return CATEGORIES[category] || [];
}
