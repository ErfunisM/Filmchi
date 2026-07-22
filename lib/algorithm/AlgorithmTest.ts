import type { RecommendRequest } from "@/lib/types";
import { RecommendationAlgorithm } from "./RecommendationAlgorithm";

/**
 * Test scenarios to demonstrate the algorithm in action
 */

// Scenario 1: Rainy day + sad mood (weather-mood connection)
const scenario1: RecommendRequest = {
  gender: "female",
  age: 28,
  country: "Iran",
  city: "Tehran",
  locationLabel: "Tehran, Iran",
  latitude: 35.6892,
  longitude: 51.3890,
  weather: "rainy",
  mood: "sad",
  story: "",
  watchTime: "night",
  company: "alone",
  locale: "fa",
  seenTitles: [],
};

// Scenario 2: Family viewing with young child (company-age connection)
const scenario2: RecommendRequest = {
  gender: "male",
  age: 35,
  country: "USA",
  city: "New York",
  locationLabel: "New York, USA",
  latitude: 40.7128,
  longitude: -74.0060,
  weather: "sunny",
  mood: "happy",
  story: "",
  watchTime: "afternoon",
  company: "family",
  locale: "en",
  seenTitles: [],
};

// Scenario 3: Romantic evening with partner (company-mood connection)
const scenario3: RecommendRequest = {
  gender: "female",
  age: 30,
  country: "France",
  city: "Paris",
  locationLabel: "Paris, France",
  latitude: 48.8566,
  longitude: 2.3522,
  weather: "cloudy",
  mood: "romantic",
  story: "",
  watchTime: "night",
  company: "partner",
  locale: "en",
  seenTitles: [],
};

// Scenario 4: Late night thriller alone (watchTime-mood connection)
const scenario4: RecommendRequest = {
  gender: "male",
  age: 25,
  country: "UK",
  city: "London",
  locationLabel: "London, UK",
  latitude: 51.5074,
  longitude: -0.1278,
  weather: "cloudy",
  mood: "thrill",
  story: "",
  watchTime: "night",
  company: "alone",
  locale: "en",
  seenTitles: [],
};

// Scenario 5: Child wanting thrill (age-mood restriction)
const scenario5: RecommendRequest = {
  gender: "male",
  age: 10,
  country: "Germany",
  city: "Berlin",
  locationLabel: "Berlin, Germany",
  latitude: 52.5200,
  longitude: 13.4050,
  weather: "sunny",
  mood: "thrill",
  story: "",
  watchTime: "afternoon",
  company: "family",
  locale: "en",
  seenTitles: [],
};

/**
 * Run test scenarios and display results
 */
export function runAlgorithmTests() {
  console.log("=== Recommendation Algorithm Test Results ===\n");

  // Test Scenario 1
  console.log("--- Scenario 1: Rainy day + sad mood ---");
  const weights1 = RecommendationAlgorithm.getWeights(scenario1);
  const insights1 = RecommendationAlgorithm.getInsights(scenario1);
  console.log("Weights:", weights1);
  console.log("Insights:", insights1);
  console.log("");

  // Test Scenario 2
  console.log("--- Scenario 2: Family viewing with young child ---");
  const weights2 = RecommendationAlgorithm.getWeights(scenario2);
  const insights2 = RecommendationAlgorithm.getInsights(scenario2);
  console.log("Weights:", weights2);
  console.log("Insights:", insights2);
  console.log("");

  // Test Scenario 3
  console.log("--- Scenario 3: Romantic evening with partner ---");
  const weights3 = RecommendationAlgorithm.getWeights(scenario3);
  const insights3 = RecommendationAlgorithm.getInsights(scenario3);
  console.log("Weights:", weights3);
  console.log("Insights:", insights3);
  console.log("");

  // Test Scenario 4
  console.log("--- Scenario 4: Late night thriller alone ---");
  const weights4 = RecommendationAlgorithm.getWeights(scenario4);
  const insights4 = RecommendationAlgorithm.getInsights(scenario4);
  console.log("Weights:", weights4);
  console.log("Insights:", insights4);
  console.log("");

  // Test Scenario 5
  console.log("--- Scenario 5: Child wanting thrill ---");
  const weights5 = RecommendationAlgorithm.getWeights(scenario5);
  const insights5 = RecommendationAlgorithm.getInsights(scenario5);
  console.log("Weights:", weights5);
  console.log("Insights:", insights5);
  console.log("");
}

// Export scenarios for manual testing
export const testScenarios = {
  scenario1,
  scenario2,
  scenario3,
  scenario4,
  scenario5,
};
