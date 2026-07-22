import type { RecommendRequest } from "@/lib/types";
import { RecommendationAlgorithm } from "./RecommendationAlgorithm";

/**
 * Full Factor Test - All 8 factors influencing the recommendation
 * 
 * This scenario demonstrates how all 8 factors work together:
 * 1. Gender: female
 * 2. Age: 24
 * 3. Country: Japan
 * 4. Weather: snowy
 * 5. Watch Time: night
 * 6. Company: partner
 * 7. Mood: romantic
 * 8. Story: specific request for anime
 */

const fullFactorScenario: RecommendRequest = {
  gender: "female",
  age: 24,
  country: "Japan",
  city: "Tokyo",
  locationLabel: "Tokyo, Japan",
  latitude: 35.6762,
  longitude: 139.6503,
  weather: "snowy",
  mood: "romantic",
  story: "I love anime movies, especially Studio Ghibli films with beautiful art and emotional stories",
  watchTime: "night",
  company: "partner",
  locale: "en",
  seenTitles: [],
};

/**
 * Run full factor test and display comprehensive results
 */
export function runFullFactorTest() {
  console.log("=== FULL FACTOR ALGORITHM TEST ===");
  console.log("All 8 factors influencing recommendation\n");

  console.log("--- Input Data ---");
  console.log("Gender:", fullFactorScenario.gender);
  console.log("Age:", fullFactorScenario.age);
  console.log("Location:", fullFactorScenario.locationLabel);
  console.log("Weather:", fullFactorScenario.weather);
  console.log("Watch Time:", fullFactorScenario.watchTime);
  console.log("Company:", fullFactorScenario.company);
  console.log("Mood:", fullFactorScenario.mood);
  console.log("Story:", fullFactorScenario.story);
  console.log("");

  console.log("--- Calculated Weights ---");
  const weights = RecommendationAlgorithm.getWeights(fullFactorScenario);
  console.log("Mood weight:", weights.mood, `(base: 1.5)`);
  console.log("Age weight:", weights.age, `(base: 1.2)`);
  console.log("Company weight:", weights.company, `(base: 1.1)`);
  console.log("Watch Time weight:", weights.watchTime, `(base: 1.0)`);
  console.log("Weather weight:", weights.weather, `(base: 0.8)`);
  console.log("Location weight:", weights.location, `(base: 0.7)`);
  console.log("Story weight:", weights.story, `(base: 2.0)`);
  console.log("");

  console.log("--- Weight Multipliers Analysis ---");
  if (weights.mood > 1.5) {
    console.log(`✓ Mood boosted: ${(weights.mood / 1.5 * 100).toFixed(0)}% increase`);
    console.log("  Reason: Snowy weather + romantic mood + partner = enhanced romantic atmosphere");
  }
  if (weights.company > 1.1) {
    console.log(`✓ Company boosted: ${(weights.company / 1.1 * 100).toFixed(0)}% increase`);
    console.log("  Reason: Partner + romantic mood = romantic viewing experience");
  }
  if (weights.age > 1.2) {
    console.log(`✓ Age boosted: ${(weights.age / 1.2 * 100).toFixed(0)}% increase`);
    console.log("  Reason: Age-appropriate content filtering");
  }
  console.log("");

  console.log("--- Algorithmic Insights ---");
  const insights = RecommendationAlgorithm.getInsights(fullFactorScenario);
  console.log(insights);
  console.log("");

  console.log("--- Expected AI Behavior ---");
  console.log("Based on the algorithmic analysis, the AI should:");
  console.log("1. Prioritize romantic anime films (especially Studio Ghibli)");
  console.log("2. Consider the snowy Tokyo atmosphere for cozy/romantic vibes");
  console.log("3. Focus on partner-appropriate content (not too intense)");
  console.log("4. Match the late-night romantic mood");
  console.log("5. Honor the specific anime/Ghibli request in the story");
  console.log("");

  console.log("--- Factor Interconnections ---");
  console.log("Weather → Mood: Snowy enhances romantic mood (1.25x multiplier)");
  console.log("Company → Mood: Partner enhances romantic mood (1.4x multiplier)");
  console.log("Story → All: Specific anime request overrides general preferences (2.0x weight)");
  console.log("Location → Culture: Japan location may suggest Asian cinema preferences");
  console.log("Age → Content: 24 years old = mature but not restricted content");
  console.log("Watch Time → Energy: Night = lower energy, more intimate atmosphere");
  console.log("Gender → Demographic: Female = may prefer certain romantic tropes");
  console.log("");

  console.log("--- Final Recommendation Strategy ---");
  console.log("Primary driver: Story (anime/Ghibli request) - 2.0x weight");
  console.log("Secondary driver: Mood (romantic) - 2.1x total weight (1.5 × 1.4)");
  console.log("Tertiary driver: Weather (snowy) - enhances romantic atmosphere");
  console.log("Supporting factors: Partner, night time, Japan location");
  console.log("");
  console.log("Expected movie types:");
  console.log("- Studio Ghibli films (Spirited Away, Howl's Moving Castle)");
  console.log("- Romantic anime with beautiful art");
  console.log("- Cozy, atmospheric films perfect for snowy nights");
  console.log("- Partner-appropriate romantic content");
}

export { fullFactorScenario };
